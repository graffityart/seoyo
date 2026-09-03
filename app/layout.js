import './globals.css';

export const metadata = {
  title: '사요 상품권',
  description: '사요 상품권 공식 사이트',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
