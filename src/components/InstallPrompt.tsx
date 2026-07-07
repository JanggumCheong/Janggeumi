"use client";

/**
 * PWA 설치 유도 (A2HS) — 하단 배너.
 *
 * 플랫폼별로 동작이 다르다:
 * - Android/데스크톱 Chrome·Edge: `beforeinstallprompt`를 가로채 커스텀 배너 →
 *   "설치" 클릭 시 `prompt()`로 네이티브 다이얼로그.
 * - iOS Safari: `beforeinstallprompt` 미지원 → "공유 → 홈 화면에 추가" 수동 안내.
 * - 이미 설치됨(standalone): 아무것도 렌더하지 않는다.
 *
 * 거부/닫기 시 localStorage에 기록해 일정 기간 재노출하지 않는다.
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 배너를 닫은 뒤 다시 띄우지 않을 기간(ms). 기본 14일. */
const DISMISS_TTL = 14 * 24 * 60 * 60 * 1000;
const DISMISS_KEY = "jg-a2hs-dismissed-at";

/** Chrome 계열이 발생시키는 beforeinstallprompt 이벤트 타입(표준 미포함). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari 전용 플래그
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iosDevice = /iphone|ipad|ipod/i.test(ua);
  // iPadOS는 데스크톱 UA로 위장 → 터치 가능한 Mac을 iPad로 취급
  const iPadOsMasquerade =
    /macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  return iosDevice || iPadOsMasquerade;
}

function recentlyDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const at = Number(raw);
  if (Number.isNaN(at)) return false;
  return Date.now() - at < DISMISS_TTL;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 이미 설치됐거나 최근에 닫았으면 표시하지 않는다.
    if (isStandalone() || recentlyDismissed()) return;

    // iOS는 beforeinstallprompt가 없으므로 수동 안내로 분기.
    if (isIos()) {
      setShowIosGuide(true);
      setVisible(true);
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault(); // 브라우저 기본 미니 배너 억제
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // localStorage 접근 실패(프라이빗 모드 등)는 무시
    }
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
    if (outcome === "dismissed") dismiss();
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="앱 설치 안내"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md",
        "px-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
      )}
    >
      <div className="flex items-start gap-3 rounded-[20px] border border-black/5 bg-card p-4 shadow-lg">
        <span className="text-2xl leading-none">👩‍🍳</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-jg-primary-strong">
            장금이 왈, 앱으로 담아두시옵소서
          </p>

          {showIosGuide ? (
            <p className="mt-1 text-xs leading-[1.5] text-jg-ink-sub">
              하단{" "}
              <span aria-hidden className="font-semibold">
                공유
              </span>{" "}
              버튼을 누른 뒤 <b>홈 화면에 추가</b>를 고르시면 되옵니다.
            </p>
          ) : (
            <p className="mt-1 text-xs leading-[1.5] text-jg-ink-sub">
              홈 화면에 장금이를 두고 더 빠르게 찾아보시옵소서.
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            {!showIosGuide && (
              <Button size="sm" onClick={install}>
                설치하기
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={dismiss}>
              다음에
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
