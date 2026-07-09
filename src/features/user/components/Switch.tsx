import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** 스크린리더용 라벨. */
  label: string;
};

/**
 * 토글 스위치 — 켜짐 = 브랜드 그린. 마이페이지 알람 on/off.
 * 목업: docs/mockups/mypage-mockup.html (ToggleSwitch)
 */
export function Switch({ checked, onCheckedChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-5 w-8.5 shrink-0 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "bg-primary" : "bg-border",
      )}
    >
      <span
        className={cn(
          "absolute left-0.75 top-0.75 size-3.5 rounded-full bg-white shadow-[0_1px_3px_rgba(31,29,24,0.28)] transition-transform",
          checked ? "translate-x-3.5" : "translate-x-0",
        )}
      />
    </button>
  );
}
