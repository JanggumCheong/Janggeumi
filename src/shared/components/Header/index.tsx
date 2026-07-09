"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronLeft, LogIn, User } from "lucide-react";
import { useAuthStore } from "../../stores";
import { HeaderIconButton } from "./HeaderIconButton";
import Image from "next/image";
import logo from "../../../../assets/images/logo.webp";
import { getIngredientName } from "@/app/ingredients/_lib/ingredients";
import { useEffect } from "react";

/** 경로 → 헤더 제목. 정확 일치 우선, 없으면 가장 긴 접두사로 매칭. */
const PAGE_TITLES: Record<string, string> = {
  "/search": "검색",
  "/ingredients": "재료",
};

const KEY = "app:navDepth";

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  // 재료 상세(/ingredients/[slug]/...)는 재료 이름을 제목으로 (예: "수박").
  const ingredientMatch = pathname.match(/^\/ingredients\/([^/]+)/);
  if (ingredientMatch) {
    const name = getIngredientName(ingredientMatch[1]);
    if (name) return name;
  }

  const prefix = Object.keys(PAGE_TITLES)
    .filter((path) => pathname.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0];

  return prefix ? PAGE_TITLES[prefix] : "";
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const isHome = pathname === "/";
  const title = resolveTitle(pathname);

  // 루트 레이아웃에 마운트
  useEffect(() => {
    const current = Number(sessionStorage.getItem(KEY) ?? "0");
    if (isHome) {
      sessionStorage.setItem(KEY, String(0));
    } else {
      sessionStorage.setItem(KEY, String(current + 1));
    }
  }, [pathname, isHome]);

  const canGoBack = () => Number(sessionStorage.getItem(KEY) ?? "0") > 1;
  const handleBack = () => (canGoBack() ? router.back() : router.push("/"));

  // 로그인(온보딩)은 전체 화면 스플래시 — 앱 헤더를 숨긴다.
  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between px-2 bg-card">
      {isHome ? (
        <span>
          <Image src={logo} alt="로고" className="h-12 w-auto" />
        </span>
      ) : (
        <div className="flex items-center gap-1">
          <HeaderIconButton label="뒤로" onClick={() => handleBack()}>
            <ChevronLeft className="size-5" />
          </HeaderIconButton>
          {title && <h1 className="text-lg font-bold">{title}</h1>}
        </div>
      )}

      <div className="flex items-center gap-1">
        {isLoggedIn ? (
          <>
            <HeaderIconButton label="알림">
              <Bell className="size-5" />
            </HeaderIconButton>
            <HeaderIconButton label="마이페이지">
              <User className="size-5" />
            </HeaderIconButton>
          </>
        ) : (
          <HeaderIconButton label="로그인" onClick={() => router.push("/login")}>
            <LogIn className="size-5" />
          </HeaderIconButton>
        )}
      </div>
    </header>
  );
}
