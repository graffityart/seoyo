import './globals.css';
import './hero-polish.css';
import './rate-polish.css';
import './apply-polish.css';
import './content-polish.css';
import './product-selector-polish.css';
import './layout-balance.css';
import './status-board.css';
import './easy-extract.css';
import './image-easy-polish.css';
import './cash-pages.css';
import './mobile-menu.css';
import './floating-quick-menu.css';
import PrivacyConsentLock from './components/PrivacyConsentLock';
import FloatingQuickMenu from './components/FloatingQuickMenu';
import GlobalSeoJsonLd from './components/GlobalSeoJsonLd';

const homeTitle='사요 상품권 문화상품권 현금화ㅣ컬쳐랜드 현금화ㅣ컬쳐랜드 매입ㅣ컬쳐랜드 문화상품권 매입 365일 24시간 운영';
const homeDescription='문화상품권 컬쳐랜드 현금화와 상품권 매입 전문 사요 상품권입니다. 365일 24시간 운영하며 회원가입 없이 간편하게 신청할 수 있습니다. 빠른 확인과 입금으로 안전하고 편리한 상품권 거래 서비스를 제공합니다.';

export const metadata = {
  metadataBase: new URL('https://seoyo.kr'),
  title: homeTitle,
  description: homeDescription,
  keywords: ['컬쳐랜드 현금화','컬쳐랜드 매입','문화상품권 매입','상품권 매입','문화상품권현금화','문상현금화','90%문화상품권매입','상품권매입','상품권교환','컬쳐 현금화','상품권 현금화','문화상품권 현금교환','컬쳐랜드매입'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://seoyo.kr/',
    siteName: '사요 상품권',
    title: homeTitle,
    description: homeDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: homeTitle,
    description: homeDescription,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body><GlobalSeoJsonLd/><PrivacyConsentLock/>{children}<FloatingQuickMenu/></body>
    </html>
  );
}
