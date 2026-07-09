#!/usr/bin/env node
// content 스킬 자동 검증기 (SKILL.md 6-B).
// 사용법: node .claude/skills/content/scripts/validate-content.mjs <id>
// 형식 정합성 + 출처 신뢰성의 "자동으로 잡을 수 있는 부분"만 검사한다.
// 주장이 실제로 참인지는 스크립트가 못 잡는다 → 6-A대로 사람이 WebFetch로 확인.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXAMPLES = join(__dirname, "..", "examples");

// 공식 기관 화이트리스트 (source.type === "official" 검증용)
const OFFICIAL_HOSTS = [
  "mfds.go.kr", // 식품의약품안전처
  "me.go.kr", // 환경부
  "rda.go.kr", // 농촌진흥청
  "nongsaro.go.kr", // 농사로(농진청)
  "korea.kr", // 정책브리핑
  "seoul.go.kr", // 지자체(대표)
  "foodsafetykorea.go.kr", // 식품안전나라
  "kfda.go.kr",
];

const id = process.argv[2];
if (!id) {
  console.error("사용법: node validate-content.mjs <id>  (예: potato)");
  process.exit(2);
}

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// ── 1. JSON 유효 ──
let d;
try {
  d = JSON.parse(readFileSync(join(EXAMPLES, `${id}.json`), "utf8"));
} catch (e) {
  console.error(`✗ JSON parse 실패: ${e.message}`);
  process.exit(1);
}

// ── slug/유일성 헬퍼 ──
const isSlug = (s) => typeof s === "string" && /^[a-z0-9-]+$/.test(s);
const dupCheck = (arr, keyFn, label) => {
  const seen = new Set();
  for (const x of arr) {
    const k = keyFn(x);
    if (seen.has(k)) err(`${label} 중복: "${k}"`);
    seen.add(k);
    if (!isSlug(k)) err(`${label} slug 규칙 위반(영문 소문자·숫자·- 만): "${k}"`);
  }
};

// ── 출처 검증 헬퍼 ──
function checkUrl(url, ctx) {
  let u;
  try {
    u = new URL(url);
  } catch {
    err(`${ctx}: source.url이 URL 형식이 아님 ("${url}")`);
    return null;
  }
  // 딥링크 검사: 경로가 없거나 "/" 뿐이면 홈/루트 → 불합격
  const path = u.pathname.replace(/\/+$/, "");
  if (path === "" || path === "/") {
    err(`${ctx}: source.url이 홈/루트 URL이라 딥링크 아님 ("${url}") — 주장이 실제 있는 구체 페이지로`);
  }
  return u;
}

function checkSource(src, ctx, { required = false, safety = false } = {}) {
  if (!src) {
    if (required) err(`${ctx}: source 필수인데 없음`);
    else if (safety) warn(`${ctx}: 안전·독성·분리배출 맥락인데 source 없이 단정 (경고)`);
    return;
  }
  if (src.url) {
    const u = checkUrl(src.url, ctx);
    if (u && src.type === "official") {
      const host = u.hostname.replace(/^www\./, "");
      const ok = OFFICIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
      if (!ok) warn(`${ctx}: type=official인데 호스트가 공식 화이트리스트에 없음 ("${host}")`);
    }
  } else {
    // url 없음: verified:true면 근거 없이 검증 주장 → 불합격.
    // verified:false면 "딥링크 못 찾아 정직하게 낮춤"(스킬 4단계 (c))이라 허용하되 경고.
    if (src.verified === true) err(`${ctx}: verified:true인데 source.url 없음 (근거 딥링크 필수)`);
    else warn(`${ctx}: source.url 없음 — 딥링크 미확보로 verified:false (후속 보강 필요)`);
  }
  if (src.verified === true && (src.type === "media" || src.type === "community")) {
    err(`${ctx}: verified:true인데 type=${src.type} (schema 규칙: official/expert만 verified)`);
  }
}

// ── rating 검사 (있으면만) ──
function checkRating(r, ctx) {
  if (!r) return; // rating은 선택 (원칙 3)
  if (r.dist) {
    const sum = Object.values(r.dist).reduce((a, b) => a + Number(b), 0);
    if (Math.abs(sum - 100) > 1) err(`${ctx}: rating.dist 합이 ${sum} (≈100 아님)`);
  }
}

// ── 2. purchase ──
if (d.purchase?.criteria) {
  dupCheck(d.purchase.criteria, (c) => c.key, "purchase.criteria.key");
  for (const c of d.purchase.criteria) {
    const toxic = /솔라닌|독성|독소|중독|아크릴아마이드/.test(`${c.title}${c.desc}`);
    checkSource(c.source, `purchase.criteria[${c.key}]`, { required: true, safety: toxic });
  }
}

// ── 3. storage ──
if (d.storage) {
  const filters = Object.fromEntries((d.storage.filters ?? []).map((f) => [f.key, new Set(f.options)]));
  const methods = d.storage.methods ?? [];
  dupCheck(methods, (m) => m.id, "storage.methods.id");

  // tags ↔ filters 정합
  for (const m of methods) {
    for (const [k, v] of Object.entries(m.tags ?? {})) {
      if (!filters[k]) err(`storage.methods[${m.id}]: tag key "${k}"가 filters에 없음`);
      else if (!filters[k].has(v)) err(`storage.methods[${m.id}]: tag "${k}=${v}"가 filters 옵션에 없음`);
    }
    checkSource(m.source, `storage.methods[${m.id}]`, { required: true });
    checkRating(m.rating, `storage.methods[${m.id}]`);
  }

  // 빈 필터 금지: 각 필터 옵션마다 매칭 카드 ≥ 1
  for (const f of d.storage.filters ?? []) {
    for (const opt of f.options) {
      const n = methods.filter((m) => m.tags?.[f.key] === opt).length;
      if (n === 0) err(`storage.filters[${f.key}] 옵션 "${opt}"에 매칭되는 method 카드 0개 (빈 필터)`);
    }
  }
}

// ── 4. handling.dispose ──
const WT = new Set(["food", "general", "recycle"]);
if (d.handling?.dispose) {
  dupCheck(d.handling.dispose, (x) => x.key, "handling.dispose.key");
  for (const x of d.handling.dispose) {
    if (!x.key || !x.title || !x.way) err(`dispose[${x.key ?? "?"}]: key/title/way 필수 누락`);
    if (!WT.has(x.wasteType)) err(`dispose[${x.key}]: wasteType "${x.wasteType}" ∉ {food,general,recycle}`);
    // 분리배출은 안전 맥락 → source 없이 단정하면 경고, 있으면 딥링크 검증
    checkSource(x.source, `dispose[${x.key}]`, { safety: true });
  }
}

// ── 5. handling.recipes (source 선택) ──
if (d.handling?.recipes) {
  dupCheck(d.handling.recipes, (r) => r.id, "handling.recipes.id");
  for (const r of d.handling.recipes) checkRating(r.rating, `recipes[${r.id}]`);
}

// ── 리포트 ──
for (const w of warnings) console.log(`⚠ 경고  ${w}`);
if (errors.length) {
  for (const e of errors) console.log(`✗ 실패  ${e}`);
  console.log(`\n검증 실패: ${errors.length}건 오류, ${warnings.length}건 경고`);
  process.exit(1);
}
console.log(`✓ 형식·출처 정합성 통과 (${warnings.length}건 경고)`);
console.log("  주의: 주장이 실제 참인지·딥링크에 그 내용이 있는지는 6-A대로 WebFetch로 확인하세요.");
process.exit(0);
