import { cn } from "@/lib/utils";
import type { SocialProvider } from "../providers";

type SocialLoginButtonProps = {
  provider: SocialProvider;
  onSelect: (provider: SocialProvider) => void;
  disabled?: boolean;
};

/**
 * SNS 로그인 버튼 (제공자 변형: kakao / naver / google).
 * 아이콘은 좌측 고정, 라벨은 가운데 정렬(제공자 무관 시각 정렬 통일).
 */
export function SocialLoginButton({ provider, onSelect, disabled }: SocialLoginButtonProps) {
  const { label, Icon, className, iconClassName } = provider;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(provider)}
      className={cn(
        "relative flex h-12 w-full items-center justify-center rounded-sm text-sm font-bold transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
    >
      <Icon className={cn("absolute left-4.5 size-6", iconClassName)} />
      {label}
    </button>
  );
}
