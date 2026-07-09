import { TabSkeleton } from "../_components/detail/TabSkeleton";

/**
 * 재료 진입(/ingredients/[slug]) 로딩 fallback.
 * 이 경로는 기본 탭(구매)으로 redirect 하는데, 그 서버 왕복 동안 화면이 멈춘 듯 보였다.
 * layout(SegmentTabs)은 유지된 채 이 스켈레톤을 스트리밍해 즉각 반응하게 한다.
 * 탭을 아직 모르므로 기본 탭(구매) 스켈레톤을 그린다.
 */
export default function Loading() {
  return <TabSkeleton tab="purchase" />;
}
