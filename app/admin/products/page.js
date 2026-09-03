import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin } from '../../../lib/admin-auth';
import { getDb } from '../../../lib/db';
import AdminLogoutButton from '../AdminLogoutButton';
import ProductEditor from './ProductEditor';

export const dynamic='force-dynamic';

export default async function AdminProductsPage(){
  if(!(await isAdmin())) redirect('/admin/login');
  const sql=getDb();
  const products=await sql`
    SELECT id,name,slug,default_rate,is_active,sort_order
    FROM products
    ORDER BY sort_order ASC,id ASC
  `;
  const safe=products.map(p=>({id:Number(p.id),name:p.name,slug:p.slug,default_rate:Number(p.default_rate),is_active:Boolean(p.is_active),sort_order:Number(p.sort_order)}));
  return <div className="adminPage">
    <div className="adminTop"><div className="adminBrand">ADMINISTRATOR</div><div className="adminActions"><a href="/" target="_blank">사이트 보기</a><AdminLogoutButton/></div></div>
    <div className="adminWrap">
      <aside className="adminSide"><h3>상품권 운영 관리</h3><Link href="/admin/orders">교환신청 관리</Link><Link className="active" href="/admin/products">상품권 관리</Link><Link href="/admin/rates">상품권 매입률 관리</Link><Link href="/admin/settings">서비스 운영 설정</Link></aside>
      <main className="adminMain"><div className="adminTitle"><small>상품권 운영</small><h1>상품권 관리</h1><p>상품권명, 노출 순서와 사용 여부를 관리합니다.</p></div><ProductEditor products={safe}/></main>
    </div>
  </div>;
}
