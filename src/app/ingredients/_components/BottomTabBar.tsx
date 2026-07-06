import Link from "next/link";
import { Home, Carrot, MessageCircle, User } from "lucide-react";

/**
 * 하단 탭바 (모바일). 홈 · 재료 · [장금이 FAB] · 커뮤니티 · 마이.
 * 가운데는 장금이 FAB(원형, 살짝 위로).
 */
export function BottomTabBar({
  active = "ingredients",
}: {
  active?: "home" | "ingredients" | "community" | "my";
}) {
  return (
    <nav className="flex items-center justify-around border-t border-border bg-card px-2 pb-2.5 pt-2">
      <TabItem icon={<Home className="size-[18px]" />} label="홈" href="/" on={active === "home"} />
      <TabItem
        icon={<Carrot className="size-[18px]" />}
        label="재료"
        href="/ingredients"
        on={active === "ingredients"}
      />

      {/* 장금이 FAB */}
      <Link
        href="/"
        className="-mt-5 flex size-[46px] items-center justify-center rounded-full border-[3px] border-card bg-primary text-[13px] font-extrabold text-primary-foreground shadow-[0_6px_20px_rgba(31,29,24,0.1)]"
      >
        장금이
      </Link>

      <TabItem
        icon={<MessageCircle className="size-[18px]" />}
        label="커뮤니티"
        href="/"
        on={active === "community"}
      />
      <TabItem icon={<User className="size-[18px]" />} label="마이" href="/" on={active === "my"} />
    </nav>
  );
}

function TabItem({
  icon,
  label,
  href,
  on,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  on: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex flex-col items-center gap-0.5 text-[10px]",
        on ? "text-primary" : "text-jg-ink-mute",
      ].join(" ")}
    >
      {icon}
      {label}
    </Link>
  );
}
