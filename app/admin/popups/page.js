import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin } from '../../../lib/admin-auth';
import { getDb } from '../../../lib/db';
import AdminLogoutButton from '../AdminLogoutButton';
import PopupEditor from './PopupEditor';

export const dynamic='force-dynamic';

export default async function AdminPopupsPage(){
  if(!(await isAdmin())) redirect('/admin/login');
  const sql=getDb();
  const rows=await sql`SELECT id,title,content,image_url,mobile_image_url,link_url,is_active,start_at,end_at,sort_order FROM site_popups ORDER BY sort_order ASC,id DESC`;
  const popups=rows.map(p=>({id:Number(p.id),title:p.title,content:p.content,image_url:p.image_url||'',mobile_image_url:p.mobile_image_url||'',link_url:p.link_url||'',is_active:Boolean(p.is_active),start_at:p.start_at?new Date(p.start_at).toISOString():'',end_at:p.end_at?new Date(p.end_at).toISOString():'',sort_order:Number(p.sort_order||0)}));
  return <div className="adminPage">
    <div className="adminTop"><div className="adminBrand">ADMINISTRATOR</div><div className="adminActions"><a href="/" target="_blank">사이트 보기</a><AdminLogoutButton/></div></div>
    <div className="adminWrap">
      <aside className="adminSide"><h3>상품권 운영 관리</h3><Link href="/admin/orders">교환신청 관리</Link><Link href="/admin/products">상품권 관리</Link><Link href="/admin/rates">상품권 매입률 관리</Link><Link href="/admin/settings">서비스 운영 설정</Link><Link className="active" href="/admin/popups">팝업 관리</Link></aside>
      <main className="adminMain"><div className="adminTitle"><small>사이트 운영</small><h1>팝업 관리</h1><p>PC·모바일 팝업 이미지, 내용, 링크와 노출 기간을 관리합니다.</p></div><PopupEditor popups={popups}/></main>
    </div>
  </div>;
}
