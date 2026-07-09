"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/stores";
import type { ProviderId, SocialProvider } from "../providers";

type UseSocialLoginResult = {
  /** 로그인 처리 중인 제공자(없으면 null). */
  pendingProvider: ProviderId | null;
  signIn: (provider: SocialProvider) => Promise<void>;
};

/**
 * SNS 로그인 시작 훅.
 *
 * 현재는 임시 인증 목업(useAuthStore)에 연결한다 — authStore와 동일하게 추후 실제
 * OAuth(제공자 authorize → 콜백 → 세션)로 교체 예정. 교체 시 이 훅 내부만 바꾸면
 * 화면(LoginView)·버튼은 그대로 재사용된다.
 */
export function useSocialLogin(nextPath: string): UseSocialLoginResult {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [pendingProvider, setPendingProvider] = useState<ProviderId | null>(null);

  async function signIn(provider: SocialProvider): Promise<void> {
    if (pendingProvider) return;
    setPendingProvider(provider.id);
    try {
      // TODO(auth): 제공자 authorize URL로 이동 → 콜백에서 세션 발급.
      login();
      router.replace(nextPath);
    } catch (error) {
      setPendingProvider(null);
      throw new Error(`${provider.label} 로그인을 시작하지 못했어요. 잠시 후 다시 시도해주세요.`, {
        cause: error,
      });
    }
  }

  return { pendingProvider, signIn };
}
