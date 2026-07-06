import type { Metadata } from "next";
import { HealthClient } from "./HealthClient";

export const metadata: Metadata = {
  title: "백엔드 상태 · 장금이",
  description: "백엔드 연결 상태 확인 (로컬/배포 분기 진단)",
  robots: { index: false }, // 진단용 페이지 — 색인 제외
};

export default function HealthPage() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-jg-primary-strong">백엔드 상태</h1>
      <p className="text-sm text-jg-ink-sub">
        프론트가 바라보는 API 주소와 백엔드 연결 상태를 확인하는 진단
        페이지입니다.
      </p>
      <HealthClient />
    </section>
  );
}
