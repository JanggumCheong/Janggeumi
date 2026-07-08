import Link from "next/link";
import { Star } from "lucide-react";
import type { StorageMethod } from "../../_lib/types";

/**
 * 보관 방법 카드 하나. 카드 전체가 Link(방법 상세로 이동 — 지금은 준비중 #).
 * 썸네일(순위 좌상단 오버레이) + 제목(추천 뱃지) + 태그 + 요약 + 별점 + 장금이 코멘트(있으면).
 * 이미지 72px(토스식 리스트 썸네일 — 스캔 밀도). 순위 배지는 카드 안쪽에 두어 넘치지 않게.
 */
export function MethodCard({
  method,
  rank,
  thumbEmoji,
  href = "#",
}: {
  method: StorageMethod;
  rank: number;
  thumbEmoji: string;
  /** 방법 상세 링크 (미정 시 #). */
  href?: string;
}) {
  const top = rank === 1;
  return (
    <Link
      href={href}
      className="block rounded-[16px] py-4 transition-colors hover:bg-black/[0.015]"
    >
      <div className="flex items-start gap-3">
        {/* 썸네일(크게) + 순위 오버레이 (카드 안쪽으로 배치) */}
        <div className="relative flex size-[72px] flex-none items-center justify-center rounded-[16px] bg-muted text-[40px]">
          <span
            className="absolute left-1 top-1 flex size-6 items-center justify-center rounded-full border text-xs font-extrabold shadow-[0_2px_10px_rgba(31,29,24,0.05)]"
            style={
              top
                ? { background: "#fbe9c9", borderColor: "#f0d9a8", color: "#b07d24" }
                : { background: "#fff", borderColor: "#e7e4dc", color: "#6b675e" }
            }
          >
            {rank}
          </span>
          <span aria-hidden>{thumbEmoji}</span>
        </div>

        {/* 정보 */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-sm font-bold">
            {method.title}
            {method.recommended && (
              <span className="rounded-[10px] bg-secondary px-1.5 py-0.5 text-[10px] font-extrabold text-jg-primary-strong">
                추천
              </span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {Object.values(method.tags).map((t) => (
              <span
                key={t}
                className="rounded-[10px] bg-muted px-1.5 py-0.5 text-[11px] font-bold text-jg-ink-sub"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mt-1 text-xs leading-[1.45] text-jg-ink-sub">
            {method.summary}
          </p>
          {method.rating && (
            <div className="mt-1 flex items-center gap-1 text-xs font-extrabold text-jg-star">
              <Star className="size-3.5 fill-current" />
              {method.rating.avg}
              <span className="font-medium text-jg-ink-mute">
                ({method.rating.count.toLocaleString()})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 코멘트 (있을 때만, 하단 전체 폭 한 줄). 화자명은 데이터(comment.author) — 장금이/유저/전문가 확장 대응. */}
      {method.comment && (
        <div className="mt-2.5 flex items-baseline gap-1.5 border-t border-dashed border-border pt-2.5">
          <span className="flex-none text-xs">👩‍🍳</span>
          <p className="line-clamp-1 min-w-0 flex-1 text-[11.5px] leading-[1.4] text-jg-ink-sub">
            <b className="font-extrabold text-primary">{method.comment.author.name}</b>{" "}
            {method.comment.text}
          </p>
        </div>
      )}
    </Link>
  );
}
