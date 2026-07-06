"use client";

/**
 * 전역 클라이언트 프로바이더 — TanStack Query.
 * App Router 루트 레이아웃에서 children을 감싼다.
 */

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/query/get-query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  // getQueryClient(): 서버는 매 요청 새로, 브라우저는 싱글톤.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
