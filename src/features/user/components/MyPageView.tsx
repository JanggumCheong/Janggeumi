"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight, UserRound } from "lucide-react";
import { useAuthStore } from "@/shared/stores";
import { MY_PROFILE } from "../data";
import { useUserStore } from "../store";
import { ProfileCard } from "./ProfileCard";
import { SettingsRow } from "./SettingsRow";
import { Switch } from "./Switch";

/**
 * 마이페이지 — 로그인 후 진입. 장금이 정보(레벨·XP) + 계정(개인정보관리) + 알람 토글 + 로그아웃.
 * 상단 헤더/하단 탭바는 루트 레이아웃(Header/TabBar)이 제공한다.
 * 목업: docs/mockups/mypage-mockup.html
 */
export function MyPageView() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logout = useAuthStore((state) => state.logout);
  const alarmEnabled = useUserStore((state) => state.alarmEnabled);
  const toggleAlarm = useUserStore((state) => state.toggleAlarm);

  // 보호 라우트 — 비로그인 접근 시 로그인으로. (임시 인증 목업 기준: 클라이언트 가드)
  useEffect(() => {
    if (!isLoggedIn) router.replace("/login?next=/mypage");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  function handleAccount() {
    // TODO(user): 개인정보관리 상세 화면(/mypage/account) 연결 — 후속 과제.
  }

  function handleLogout() {
    logout();
    router.replace("/");
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      <ProfileCard profile={MY_PROFILE} />

      <section>
        <h2 className="px-1 pb-3 text-sm font-semibold text-muted-foreground">계정</h2>
        <div className="flex flex-col gap-3">
          <SettingsRow
            icon={UserRound}
            tone="acct"
            title="개인정보관리"
            onClick={handleAccount}
            trailing={<ChevronRight className="size-5 text-jg-ink-mute" />}
          />
          <SettingsRow
            icon={Bell}
            tone="alarm"
            title="알람"
            desc="특가·장보기 리마인드 알림"
            trailing={
              <Switch checked={alarmEnabled} onCheckedChange={toggleAlarm} label="알람 알림 받기" />
            }
          />
        </div>
      </section>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleLogout}
          className="text-[13px] font-semibold text-jg-ink-mute underline underline-offset-[3px]"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
