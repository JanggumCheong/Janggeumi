import { create } from "zustand";

interface UserSettingsState {
  /** 특가·장보기 리마인드 알림 수신 여부. */
  alarmEnabled: boolean;
  /** 알람 on/off 토글(낙관적 반영). */
  toggleAlarm: () => void;
}

/**
 * 마이페이지 사용자 설정 상태 목업 — 추후 서버 저장(settings)으로 교체.
 * 교체 시 toggleAlarm 내부만 서버 액션 호출로 바꾸면 화면은 그대로 재사용된다.
 */
export const useUserStore = create<UserSettingsState>()((set) => ({
  alarmEnabled: true,
  toggleAlarm: () => set((state) => ({ alarmEnabled: !state.alarmEnabled })),
}));
