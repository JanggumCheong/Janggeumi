import type { ComponentType, SVGProps } from "react";
import { GoogleIcon, KakaoIcon, NaverIcon } from "./components/provider-icons";

/** 지원 SNS 로그인 제공자. 참조 이미지 기준 순서: 카카오 → 네이버 → 구글. */
export type ProviderId = "kakao" | "naver" | "google";

export type SocialProvider = {
  id: ProviderId;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /**
   * 버튼 표면 스타일. 제공자 브랜드 색은 디자인 토큰의 유일한 예외(OAuth 브랜드 준수).
   * 그 외 화면 색은 전부 기존 토큰을 사용한다.
   */
  className: string;
  /** 아이콘 색(제공자 브랜드 대비색). */
  iconClassName: string;
};

export const SOCIAL_PROVIDERS: readonly SocialProvider[] = [
  {
    id: "kakao",
    label: "카카오로 시작하기",
    Icon: KakaoIcon,
    className: "bg-[#FEE500] text-[#191600] hover:bg-[#FADA0A] focus-visible:ring-[#FEE500]",
    iconClassName: "text-[#191600]",
  },
  {
    id: "naver",
    label: "네이버로 시작하기",
    Icon: NaverIcon,
    className: "bg-[#03C75A] text-white hover:bg-[#02B14F] focus-visible:ring-[#03C75A]",
    iconClassName: "text-white",
  },
  {
    id: "google",
    label: "구글로 시작하기",
    Icon: GoogleIcon,
    className:
      "border border-border bg-card text-foreground hover:bg-muted focus-visible:ring-primary",
    iconClassName: "",
  },
] as const;
