import notFoundImage from "../../assets/images/janggeumi-404.png";
import { ErrorState } from "@/components/ErrorState";

/**
 * 404 — 찾는 페이지가 없을 때. 장금이 일러스트("상품이 없어요" 카피 박힘) + 홈 CTA.
 * 에러 화면(error.tsx)과 같은 ErrorState를 써 시각 언어를 공유한다 — 일러스트만 다름.
 * 일러스트에 카피가 있어 title은 생략, 화면 텍스트는 보조로만. 재시도 개념이 없어 홈 CTA만.
 */
export default function NotFound() {
  return (
    <ErrorState
      image={notFoundImage}
      imageAlt="찾으시는 페이지가 없어요 — 장금이"
      description="주소가 바뀌었거나, 아직 준비되지 않은 재료일 수 있어요."
      primary={{ label: "홈으로 돌아가기", href: "/" }}
    />
  );
}
