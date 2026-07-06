import type { PurchaseCriterion } from "../../_lib/types";
import { collectSources } from "../../_lib/sources";

/**
 * 출처 요약 — 신뢰 근거(E-E-A-T = SEO·GEO 핵심).
 * 무채색 배경(확률 게이지와 위계 분리). 요약 문구는 항상 노출, 상세만 접기.
 * <details>(HTML 네이티브)로 접어도 DOM에 존재 → 크롤러·AI가 읽음(SSR). 행 전체가 토글.
 * criteria별 유니크 출처를 집계, 등급(공식 ✔ / 영상 ▶ 등) 구분.
 */
export function SourceSummary({
  criteria,
}: {
  criteria: PurchaseCriterion[];
}) {
  const sources = collectSources(criteria);
  if (sources.length === 0) return null;

  const primary = sources[0].org;

  return (
    <details className="rounded-[16px] border border-border bg-muted text-[11.5px] text-jg-ink-sub [&_.more-open]:hidden [&[open]_.more-closed]:hidden [&[open]_.more-open]:inline">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-[16px] px-3 py-[11px] font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="font-extrabold text-jg-buy">✔</span>
        {sources.length === 1 ? (
          <span>{primary} 자료를 바탕으로 해요</span>
        ) : (
          <span>
            {primary} 등 <b>{sources.length}곳</b>의 출처를 바탕으로 해요
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-0.5 font-bold text-jg-ink-mute">
          자세히
          <span className="more-closed">▾</span>
          <span className="more-open">▴</span>
        </span>
      </summary>

      <ul className="flex list-none flex-col gap-[7px] px-3 pb-[11px] pt-0.5">
        {sources.map((s, i) => (
          <li key={`${s.org}-${i}`} className="flex items-center gap-1.5">
            <GradeTag type={s.type} />
            <span>
              {s.mediaType === "video" && "▶ "}
              {s.org}
              {s.lastReviewed && ` · 검증 ${s.lastReviewed}`}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}

/** 출처 신뢰 등급 뱃지. 공식(초록) / 영상·미디어(주황) / 그 외(회색). */
function GradeTag({ type }: { type: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    official: { label: "공식", cls: "text-jg-buy bg-[#e2ebdb]" },
    expert: { label: "전문가", cls: "text-jg-buy bg-[#e2ebdb]" },
    media: { label: "영상", cls: "text-jg-use bg-jg-use-bg" },
    community: { label: "커뮤니티", cls: "text-jg-ink-sub bg-muted" },
  };
  const g = map[type] ?? { label: type, cls: "text-jg-ink-sub bg-muted" };
  return (
    <span
      className={`flex-none rounded-[10px] px-1.5 py-px text-[10px] font-extrabold ${g.cls}`}
    >
      {g.label}
    </span>
  );
}
