import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin } from '../../../lib/admin-auth';
import { getServiceSettings } from '../../../lib/db';
import AdminLogoutButton from '../AdminLogoutButton';
import SettingsEditor from './SettingsEditor';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage(){
  if(!(await isAdmin())) redirect('/admin/login');
  const settings = await getServiceSettings();
  return <div className="adminPage">
    <div className="adminTop"><div className="adminBrand">ADMINISTRATOR</div><div className="adminActions"><a href="/" target="_blank">사이트 보기</a><AdminLogoutButton/></div></div>
    <div className="adminWrap">
      <aside className="adminSide"><h3>상품권 운영 관리</h3><Link href="/admin/orders">교환신청 관리</Link><Link href="/admin/products">상품권 관리</Link><Link href="/admin/rates">상품권 매입률 관리</Link><Link className="active" href="/admin/settings">서비스 운영 설정</Link><Link href="/admin/popups">팝업 관리</Link></aside>
      <main className="adminMain"><div className="adminTitle"><small>서비스 운영</small><h1>서비스 운영 설정</h1><p>최소 판매금액, 접수 수수료, 메인 안내문구와 실시간 노출 건수를 관리합니다.</p></div><SettingsEditor initial={settings}/></main>
    </div>
  </div>;
}
