import Link from 'next/link';import { redirect } from 'next/navigation';import { isAdmin } from '../../../lib/admin-auth';import { getDb } from '../../../lib/db';import AdminLogoutButton from '../AdminLogoutButton';export const dynamic = 'force-dynamic';export default async function AdminOrdersPage(){if(!(await isAdmin()))redirect('/admin/login');const sql=getDb();const orders=await sql`SELECT o.id, o.order_no, o.customer_name, o.requested_amount, o.expected_amount, o.paid_amount, o.status, o.created_at,
      COALESCE(string_agg(DISTINCT p.name, ', '), '') AS product_names,
      COUNT(oi.id)::int AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id=o.id
    LEFT JOIN products p ON p.id=oi.product_id
    WHERE o.deleted_at IS NULL
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT 100
  `;
  const counts = orders.reduce((a,o)=>{a.total++; a[o.status]=(a[o.status]||0)+1; return a;},{total:0,received:0,reviewing:0,paid:0,rejected:0});
  return <div className="adminPage">
    <div className="adminTop"><div className="adminBrand">ADMINISTRATOR</div><div className="adminActions"><a href="/" target="_blank">사이트 보기</a><AdminLogoutButton/></div></div>
    <div className="adminWrap">
      <aside className="adminSide"><h3>상품권 운영 관리</h3><Link className="active" href="/admin/orders">교환신청 관리</Link><Link href="/admin/products">상품권 관리</Link><Link href="/admin/rates">상품권 매입률 관리</Link><Link href="/admin/settings">서비스 운영 설정</Link><Link href="/admin/notices">공지사항 관리</Link><Link href="/admin/popups">팝업 관리</Link></div><main className="adminMain"><div className="adminTitle"><small>상품권 운영</small><h1>상품권 관리</h1><p>상품권명, 노출 순서와 사용 여부를 관리합니다.</p></div><ProductEditor products={safeProducts}/></main></div></div>