import type { Metadata } from "next";
import { MyPageView } from "@/features/user";

export const metadata: Metadata = {
  title: "마이페이지 · 장금이",
  description: "장금이 정보와 계정·알람 설정을 한곳에서 관리하세요.",
};

export default function MyPage() {
  return <MyPageView />;
}
