import type { Metadata } from "next";
import { LoginView } from "@/features/auth";

export const metadata: Metadata = {
  title: "로그인 · 장금이",
  description: "카카오·네이버·구글로 3초 만에 시작하세요. 가입과 로그인이 하나로 처리됩니다.",
};

/** 내부 경로만 허용(오픈 리다이렉트 방지). 외부/프로토콜상대 경로는 홈으로. */
function resolveNext(next: string | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginView nextPath={resolveNext(next)} />;
}
