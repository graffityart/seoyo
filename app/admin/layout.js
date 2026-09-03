import './admin.css';
import './admin-detail.css';

export const metadata = {
  title: '사요 상품권 관리자',
  description: '사요 상품권 교환신청 관리 화면',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return children;
}
