"use client";

import errorImage from "../../assets/images/janggeumi-error.png";
import { ErrorState } from "@/components/ErrorState";

/**
 * 전역 에러 바운더리 — 재료 상세 외 모든 페이지(홈·검색 등)의 렌더 예외를 받는다.
 * Next 기본 500 화면 대신 장금이 톤(ErrorState). 재료 상세는 [slug]/error.tsx가
 * 먼저 잡으므로, 여기는 그 밖의 페이지용이다.
 *
 * 루트 layout 자체가 터진 경우는 global-error.tsx가 필요하지만(앱 셸 없이 단독 렌더),
 * 마케팅상 앱 셸 유지가 낫다고 판단해 지금은 두지 않는다(상세+전역 2계층).
 */
export default function GlobalRouteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      image={errorImage}
      imageAlt="문제가 생겼어요 — 장금이"
      title="잠시 문제가 생겼어요"
      description="화면을 불러오는 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요."
      primary={{ label: "다시 시도", onClick: reset }}
      secondary={{ label: "홈으로", href: "/" }}
    />
  );
}
