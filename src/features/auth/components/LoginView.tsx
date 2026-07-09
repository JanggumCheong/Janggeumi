"use client";

import { SOCIAL_PROVIDERS } from "../providers";
import { useSocialLogin } from "../hooks/useSocialLogin";
import { AuthLogo } from "./AuthLogo";
import { SocialLoginButton } from "./SocialLoginButton";

type LoginViewProps = {
  /** 로그인 성공 후 이동할 내부 경로(기본 홈). */
  nextPath?: string;
};

/**
 * 로그인(온보딩) 화면 — SNS 3초 로그인.
 * 배경은 DS 원칙대로 near-white(bg-background). 따뜻함은 캐릭터·그린 포인트로만.
 * 목업: docs/mockups/login-mockup.html
 */
export function LoginView({ nextPath = "/" }: LoginViewProps) {
  const { pendingProvider, signIn } = useSocialLogin(nextPath);

  return (
    <div className="flex min-h-full flex-col">
      {/* 히어로 — 브랜드 로고 로크업(캐릭터 + 워드마크) */}
      <div className="flex flex-1 flex-col items-center justify-center pt-6 text-center">
        <h1 className="m-0">
          <AuthLogo />
        </h1>
        <p className="-mt-2 text-base font-semibold text-muted-foreground">
          마트에서 살 식재료, 똑똑하게
        </p>
      </div>

      {/* SNS 버튼 스택 */}
      <div className="mt-10 flex flex-col gap-3">
        {SOCIAL_PROVIDERS.map((provider) => (
          <SocialLoginButton
            key={provider.id}
            provider={provider}
            onSelect={signIn}
            disabled={pendingProvider !== null}
          />
        ))}
      </div>

      {/* 푸터 — 구분선 + 안내 카피 */}
      <div className="mt-8 flex flex-col items-center text-center">
        <div className="flex w-full justify-center">
          <span className="text-xs font-semibold tracking-wide text-jg-ink-mute">
            SNS로 3초 만에 로그인
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-jg-ink-mute">
          계속 이용 시 이용약관 · 개인정보처리 방침에 동의
        </p>
      </div>
    </div>
  );
}
