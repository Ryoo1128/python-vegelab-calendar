import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNIQLO 경쟁사 광고 모니터링",
  description: "경쟁사 공식 프로모션, 네이버, Meta, Google, Instagram 공개 화면 수집 대시보드",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
