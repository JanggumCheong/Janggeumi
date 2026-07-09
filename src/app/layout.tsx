import type { Metadata, Viewport } from "next";
import "./globals.css";
import { InstallPrompt } from "@/components/InstallPrompt";
import { Providers } from "./providers";
import { Header, TabBar } from "@/shared";

export const metadata: Metadata = {
  title: "장금이",
  description: "식재료 구매·보관·처리를 한눈에, 장금이",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "장금이",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#5C6E3D",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="font-sans">
      <body className="flex h-dvh flex-col items-center bg-muted antialiased">
        <Providers>
          {/* 모바일 앱 셸 — 뷰포트 높이 고정. 헤더/탭바 고정 + 본문(main)만 스크롤.
              body가 아니라 main이 스크롤 컨테이너라, sticky 헤더 이중 스크롤 흔들림이 없다. */}
          <div className="flex h-full min-h-0 w-full flex-col bg-background sm:w-105 sm:shadow-[0_6px_20px_rgba(31,29,24,0.10)]">
            <Header />
            <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-10 pt-5 scrollbar-none [&::-webkit-scrollbar]:hidden">
              {children}
            </main>
            <TabBar />
            <InstallPrompt />
          </div>
        </Providers>
      </body>
    </html>
  );
}
