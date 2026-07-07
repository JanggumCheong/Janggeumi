import Link from "next/link";

/**
 * 404 — 찾는 페이지가 없을 때. 장금이 화자 톤으로.
 * 앱 공통 셸(Header/TabBar)은 루트 layout이 제공하므로 여기선 콘텐츠만 렌더한다.
 * 디자인 토큰만 사용(HeroSpeaker·CreateCTA 패턴 재사용).
 */
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-16 text-center">
      {/* 장금이 화자 */}
      <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-3xl">
        👩‍🍳
      </span>

      <div className="flex flex-col gap-2">
        {/* 큰 몰입 카피 (주인공) */}
        <p className="text-[22px] font-extrabold leading-[1.35]">
          찾으시는 것이
          <br />
          여기 없는 것이옵니다
        </p>
        <p className="text-[13px] text-jg-ink-sub">
          주소가 바뀌었거나, 아직 준비되지 않은 재료일 수 있어요.
        </p>
      </div>

      {/* 홈으로 (primary CTA — CreateCTA 패턴) */}
      <Link
        href="/"
        className="mt-1 inline-flex items-center justify-center rounded-[16px] bg-primary px-6 py-3.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
