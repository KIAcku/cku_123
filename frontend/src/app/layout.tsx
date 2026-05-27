import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "마음이음 — 학생 심리 케어 플랫폼",
  description: "AI 기반 감정 분석, 익명 상담, 커뮤니티를 통해 학생의 마음 건강을 지원합니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
