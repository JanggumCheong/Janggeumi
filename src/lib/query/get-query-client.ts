import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

/**
 * QueryClient 생성 (App Router SSR 안전 패턴).
 *
 * - 서버: 매 요청마다 새 인스턴스 (요청 간 캐시 공유 방지).
 * - 브라우저: 싱글톤으로 재사용 (React suspend 시 재생성 방지).
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SSR에서 클라이언트가 즉시 refetch하지 않도록 최소 staleTime 부여
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // pending 쿼리도 dehydrate 대상에 포함 (streaming SSR 대비)
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
