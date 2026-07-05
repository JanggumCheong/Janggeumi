import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ko">
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
