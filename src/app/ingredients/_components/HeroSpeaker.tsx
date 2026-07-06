/**
 * 히어로 — 장금이 화자 라벨 + SEO h1 + 몰입 카피 (세 탭 공통).
 *
 * 토스식: 큰 카피가 주인공, 장금이는 카피 위 작은 화자 라벨(삽화와 경쟁 X).
 * SEO/몰입 역할 분리: h1엔 검색어, 화면엔 몰입 카피.
 * 재료명은 데이터로 받아 하드코딩하지 않음.
 */
export function HeroSpeaker({
  seoTitle,
  copy,
  sub,
}: {
  /** SEO용 h1 (검색어 포함, 예: "수박 고르는 법"). 화면엔 작게. */
  seoTitle: string;
  /** 큰 몰입 카피 (예: "좋은 수박은 이렇게 고르는 것이옵니다"). */
  copy: React.ReactNode;
  /** 카피 아래 보조 문구. */
  sub?: string;
}) {
  return (
    <div>
      {/* 화자: 장금이 (작게, 카피 위 한 줄) */}
      <div className="mb-2 inline-flex items-center gap-1.5">
        <span className="flex size-[22px] items-center justify-center rounded-full bg-secondary text-[13px]">
          👩‍🍳
        </span>
        <span className="text-xs font-extrabold text-primary">장금이 왈,</span>
      </div>

      {/* SEO h1 (검색어). 화면엔 작게. */}
      <h1 className="text-[11px] font-bold text-jg-ink-mute">{seoTitle}</h1>

      {/* 몰입 카피 (주인공) */}
      <p className="text-[22px] font-extrabold leading-[1.35]">{copy}</p>

      {sub && <p className="mt-1 text-[13px] text-jg-ink-sub">{sub}</p>}
    </div>
  );
}
