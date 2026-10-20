import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'PaceMaker RC // 러닝 크루 게시판',
  description: '러닝 크루원들을 위한 세션 모집, 일정 공유 및 러닝 보드',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen bg-crew-bg antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
