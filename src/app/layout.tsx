import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Header, TabBar } from "../../shared";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Janggeumi",
  description: "Janggeumi Next.js project",
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
