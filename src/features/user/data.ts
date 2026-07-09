/** 마이페이지 프로필(장금이 정보). 현재는 목업 상수 — 추후 실제 user 조회로 교체. */
export type MyProfile = {
  /** 표시 이름(뒤에 "님"을 붙여 노출). */
  nickname: string;
  /** 현재 레벨. */
  level: number;
  /** 레벨 티어명(예: "수라간"). */
  tier: string;
  /** 현재 경험치. */
  xp: number;
  /** 다음 레벨까지 필요한 경험치. */
  xpToNext: number;
  /** 프로필 카드 한 줄 상태 문구. */
  statusLine: string;
};

/** TODO(user): 실제 세션 사용자로 교체. 지금은 화면 구성을 위한 목업 값. */
export const MY_PROFILE: MyProfile = {
  nickname: "장금이",
  level: 5,
  tier: "수라간",
  xp: 720,
  xpToNext: 1000,
  statusLine: "오늘도 알뜰 장보기 완료!",
};
