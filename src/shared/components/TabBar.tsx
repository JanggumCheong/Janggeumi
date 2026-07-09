"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, LogIn, User, type LucideIcon } from "lucide-react";
import { useAuthStore } from "../stores";

type Tab = {
  href: string;
  label: string;
  icon: LucideIcon;
};

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function TabBar() {
  const pathname = usePathname();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  // 로그인(온보딩)은 전체 화면 스플래시 — 하단 탭바를 숨긴다.
  if (pathname === "/login") return null;

  const authTab: Tab = isLoggedIn
    ? { href: "/mypage", label: "마이페이지", icon: User }
    : { href: "/login", label: "로그인", icon: LogIn };

  const tabs: Tab[] = [
    { href: "/", label: "홈", icon: Home },
    { href: "/search", label: "검색", icon: Search },
    authTab,
  ];

  return (
    <nav className="sticky bottom-0 z-20 flex w-full items-stretch border-t border-border bg-card">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold ${
              active ? "text-primary" : "text-jg-ink-mute"
            }`}
          >
            <Icon className="size-6" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
