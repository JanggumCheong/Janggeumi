import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsRowProps = {
  icon: LucideIcon;
  /** 아이콘 배경 톤(계정=그린 soft / 알람=주황 soft). */
  tone: "acct" | "alarm";
  title: string;
  desc?: string;
  /** 있으면 행 전체가 버튼(진입형). 없으면 정적 행(토글형). */
  onClick?: () => void;
  /** 우측 요소(진입 chevron 또는 토글 스위치). */
  trailing?: ReactNode;
};

const TONE: Record<SettingsRowProps["tone"], string> = {
  acct: "bg-secondary text-primary",
  alarm: "bg-jg-use-bg text-jg-use",
};

/**
 * 계정 설정 행 — 좌측 아이콘 + 제목(+부제) + 우측 요소.
 * 진입형(onClick)은 button, 토글형은 정적 div로 렌더한다.
 * 목업: docs/mockups/mypage-mockup.html (SettingsRow)
 */
export function SettingsRow({
  icon: Icon,
  tone,
  title,
  desc,
  onClick,
  trailing,
}: SettingsRowProps) {
  const base = "flex w-full items-center gap-3.5 rounded-lg bg-card p-4 ring-1 ring-foreground/10";

  const content = (
    <>
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", TONE[tone])}>
        <Icon className="size-5.25" strokeWidth={1.8} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {desc && <span className="text-xs font-medium text-jg-ink-mute">{desc}</span>}
      </span>
      {trailing}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(base, "text-left transition-colors active:bg-muted")}
      >
        {content}
      </button>
    );
  }

  return <div className={base}>{content}</div>;
}
