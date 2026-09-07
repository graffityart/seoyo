import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin } from '../../../lib/admin-auth';
import { getNotices, formatNoticeDate } from '../../../lib/notice-db';
import AdminLogoutButton from '../AdminLogoutButton';
import NoticeEditor from './NoticeEditor';

export const dynamic='force-dynamic';

export default async function AdminNoticesPage(){
  if(!(await isAdmin())) redirect('/admin/login');
  const rows=await getNotices({publishedOnly:false,limit:100});
  const notices=rows.map(n=>({id:Number(n.id),title:n.title||'',content:n.content||'',is_published:Boolean(n.is_published),is_pinned:Boolean(n.is_pinned),created_at_label:formatNoticeDate(n.created_at)}));
  return <div className="adminPage">
    <div className="adminTop"><div className="adminBrand">ADMINISTRATOR</div><div className="adminActions"><a href="/" target="_blank">사이트 보기</a><AdminLogoutButton/></div></div>
    <div className="adminWrap">
      <aside className="adminSide"><h3>상품권 운영 관리</h3><Link href="/admin/orders">교환신청 관리</Link><Link href="/admin/products">상품권 관리</Link><Link href="/admin/rates">상품권 매입률 관리</Link><Link href="/admin/settings">서비스 운영 설정</Link><Link href="/admin/popups">팝업 관리</Link><Link className="active" href="/admin/notices">공지사항 관리</Link></aside>
      <main className="adminMain"><div className="adminTitle"><small>BOARD MANAGEMENT</small><h1>공지사항 관리</h1><p>메인 화면과 공지사항 게시판에 노출되는 글을 등록·수정·삭제합니다.</p></div><NoticeEditor notices={notices}/></main>
    </div>
  </div>;
}
