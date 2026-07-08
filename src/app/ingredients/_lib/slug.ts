/**
 * 재료 slug ↔ API id 변환, 그리고 slug별 표시 메타(emoji·name).
 *
 * 프론트 slug(watermelon) ↔ 백엔드 id(ing_watermelon).
 * emoji는 API가 안 주고, name은 헤더가 동기로 필요(클라 컴포넌트)해 여기서 매핑한다.
 * 재료가 늘면 META에 추가.
 */

/** 프론트 slug(watermelon) → API id(ing_watermelon). */
export function toApiId(slug: string): string {
  return `ing_${slug.replace(/-/g, "_")}`;
}

/** 재료 slug → 표시 메타(이모지·이름). 로컬 JSON/API에 없을 때의 fallback. */
const META: Record<string, { emoji: string; name: string }> = {
  watermelon: { emoji: "🍉", name: "수박" },
  potato: { emoji: "🥔", name: "감자" },
  "green-onion": { emoji: "🌿", name: "대파" },
  peach: { emoji: "🍑", name: "천도복숭아" },
  corn: { emoji: "🌽", name: "옥수수" },
  cucumber: { emoji: "🥒", name: "오이" },
  onion: { emoji: "🧅", name: "양파" },
  tomato: { emoji: "🍅", name: "토마토" },
  cabbage: { emoji: "🥬", name: "양배추" },
  tofu: { emoji: "🧈", name: "두부" },
  chicken: { emoji: "🍗", name: "닭고기" },
  squid: { emoji: "🦑", name: "오징어" },
  egg: { emoji: "🥚", name: "계란" },
};

/** slug → 이모지. 매핑 없으면 중립 자리표시. */
export function emojiFor(slug: string): string {
  return META[slug]?.emoji ?? "🥗";
}

/** slug → 재료 이름(매핑 fallback). 없으면 null. */
export function nameFor(slug: string): string | null {
  return META[slug]?.name ?? null;
}
