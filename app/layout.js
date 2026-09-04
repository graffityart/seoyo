import './globals.css';
import './hero-polish.css';
import './rate-polish.css';
import './apply-polish.css';
import './content-polish.css';
import './product-selector-polish.css';

export const metadata = {
  metadataBase: new URL('https://seoyo.kr'),
  title: '사요 상품권 | 상품권 매입시세·현금교환 안내',
  description: '사요 상품권에서 컬쳐랜드, 북앤라이프, 틴캐시, 롯데 모바일상품권, 구글 기프트카드의 오늘 매입률과 상품권 교환 이용방법을 확인하세요.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://seoyo.kr/',
    siteName: '사요 상품권',
    title: '사요 상품권 | 상품권 매입시세·현금교환 안내',
    description: '오늘의 상품권 매입률과 교환 신청, 처리 현황을 한눈에 확인하는 사요 상품권입니다.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
