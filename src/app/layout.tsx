import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Header, TabBar } from "../../shared";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

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
    <html lang="ko" className={cn("font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col antialiased items-center bg-white">
        {/* 모바일 앱 컨테이너 */}
        <div className="flex w-full flex-col bg-background sm:w-105">
          <Header />
          <main className="flex-1 overflow-y-auto px-5 pb-24 pt-5">{children}</main>
          <TabBar />
        </div>
      </body>
    </html>
  );
}
