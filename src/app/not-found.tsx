import Link from "next/link";
import Image from "next/image";
import notFoundImage from "../../assets/images/janggeumi-404.png";

/**
 * 404 — 찾는 페이지가 없을 때. 장금이 일러스트 + 홈 CTA.
 * 앱 공통 셸(Header/TabBar)은 루트 layout이 제공하므로 여기선 콘텐츠만 렌더한다.
 * 일러스트에 "상품이 없어요" 카피가 있어 화면 텍스트는 보조로만.
 */
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-12 text-center">
      {/* 장금이 일러스트 (주인공). 투명 배경 원형 PNG. */}
      <Image
        src={notFoundImage}
        alt="찾으시는 페이지가 없어요 — 장금이"
        width={220}
        height={220}
        priority
        className="size-55"
      />

      <p className="text-[13px] text-jg-ink-sub">
        주소가 바뀌었거나, 아직 준비되지 않은 재료일 수 있어요.
      </p>

      {/* 홈으로 (primary CTA) */}
      <Link
        href="/"
        className="mt-1 inline-flex items-center justify-center rounded-[16px] bg-primary px-6 py-3.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
