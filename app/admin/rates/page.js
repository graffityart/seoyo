import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin } from '../../../lib/admin-auth';
import { getDb } from '../../../lib/db';
import AdminLogoutButton from '../AdminLogoutButton';
import RateEditor from './RateEditor';

export const dynamic = 'force-dynamic';

export default async function AdminRatesPage(){
  if(!(await isAdmin())) redirect('/admin/login');
  const sql = getDb();
  const products = await sql`
    SELECT id, name, slug, default_rate
    FROM products
    WHERE is_active=true
    ORDER BY sort_order ASC, id ASC
  `;
  const safeProducts = products.map(p=>({id:Number(p.id),name:p.name,slug:p.slug,default_rate:Number(p.default_rate)}));

  return <div className="adminPage">
    <div className="adminTop"><div className="adminBrand">ADMINISTRATOR</div><div className="adminActions"><a href="/" target="_blank">사이트 보기</a><AdminLogoutButton/></div></div>
    <div className="adminWrap">
      <aside className="adminSide"><h3>상품권 운영 관리</h3><Link href="/admin/orders">교환신청 관리</Link><Link href="/admin/products">상품권 관리</Link><Link className="active" href="/admin/rates">상품권 매입률 관리</Link><Link href="/admin/settings">서비스 운영 설정</Link><Link href="/admin/popups">팝업 관리</Link></aside>
      <main className="adminMain">
        <div className="adminTitle"><small>상품권 운영</small><h1>상품권 매입률 관리</h1><p>변경한 매입률은 메인 화면과 교환신청 계산에 바로 반영됩니다.</p></div>
        <RateEditor products={safeProducts}/>
      </main>
    </div>
  </div>;
}
