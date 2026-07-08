"use client";

import errorImage from "../../../../assets/images/janggeumi-error.png";
import { ErrorState } from "@/components/ErrorState";

/**
 * 재료 상세 에러 바운더리.
 * 이 라우트는 매 요청 API에 의존한다(존재 확인·상세 조회). 백엔드가 죽었거나
 * 예상치 못한 예외가 나면 Next 기본 500 화면("This page couldn't load") 대신
 * 장금이 톤(ErrorState)으로 안내하고 재시도(reset)·홈 이동을 준다.
 *
 * 404(not-found)와 같은 ErrorState를 써 시각 언어를 공유한다 — 일러스트만
 * "?" 갸웃(janggeumi-error)으로 달라 "없음(404)"과 "일시 장애(에러)"를 포즈로 구분.
 * error 바운더리는 클라이언트 컴포넌트여야 한다(Next 규약).
 */
export default function IngredientError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      image={errorImage}
      imageAlt="문제가 생겼어요 — 장금이"
      title="잠시 문제가 생겼어요"
      description="재료 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
      primary={{ label: "다시 시도", onClick: reset }}
      secondary={{ label: "홈으로", href: "/" }}
    />
  );
}
