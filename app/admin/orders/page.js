import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin } from '../../../lib/admin-auth';
import { getDb } from '../../../lib/db';
import AdminLogoutButton from '../AdminLogoutButton';

const statusLabel = { received:'접수중', reviewing:'확인중', paid:'입금완료', rejected:'처리불가' };

function kst(value){
  return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
}

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage(){
  if(!(await isAdmin())) redirect('/admin/login');
  const sql = getDb();
  const orders = await sql`
    SELECT o.id, o.order_no, o.customer_name, o.requested_amount, o.expected_amount, o.paid_amount, o.status, o.created_at,
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
      <aside className="adminSide"><h3>상품권 운영 관리</h3><Link className="active" href="/admin/orders">교환신청 관리</Link><Link href="/admin/products">상품권 관리</Link><Link href="/admin/rates">상품권 매입률 관리</Link><Link href="/admin/settings">서비스 운영 설정</Link><Link href="/admin/popups">팝업 관리</Link></aside>
      <main className="adminMain">
        <div className="adminTitle"><small>상품권 운영</small><h1>교환신청 관리</h1><p>접수된 상품권 신청과 처리상태를 확인합니다.</p></div>
        <div className="adminSummary"><div className="summaryCard"><span>전체</span><b>{counts.total}</b></div><div className="summaryCard"><span>접수중</span><b>{counts.received}</b></div><div className="summaryCard"><span>확인중</span><b>{counts.reviewing}</b></div><div className="summaryCard"><span>입금완료</span><b>{counts.paid}</b></div></div>
        <section className="adminPanel">
          <table className="orderTable"><thead><tr><th>접수번호</th><th>신청자</th><th>상품권</th><th>신청금액</th><th>입금 금액</th><th>상태</th><th>접수일</th><th></th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td className="orderNo">{o.order_no}</td><td>{o.customer_name}</td><td>{o.product_names}{o.item_count>1?` ${o.item_count}건`:''}</td><td>{Number(o.requested_amount).toLocaleString()}원</td><td>{Number(o.expected_amount).toLocaleString()}원</td><td><span className={`status ${o.status}`}>{statusLabel[o.status]||o.status}</span></td><td>{kst(o.created_at)}</td><td><Link className="detailBtn" href={`/admin/orders/${o.id}`}>상세보기</Link></td></tr>)}</tbody></table>
          <div className="mobileOrders">{orders.map(o=><article className="mobileOrder" key={o.id}><div className="mobileOrderTop"><b className="orderNo">{o.order_no}</b><span className={`status ${o.status}`}>{statusLabel[o.status]||o.status}</span></div><h3>{o.customer_name}</h3><p>{o.product_names} · {o.item_count}건</p><p>{kst(o.created_at)}</p><div className="mobileOrderBottom"><div><span>신청금액</span><b>{Number(o.requested_amount).toLocaleString()}원</b></div><div><span>입금 금액</span><b>{Number(o.expected_amount).toLocaleString()}원</b></div></div><Link className="detailBtn" href={`/admin/orders/${o.id}`}>신청 상세 확인</Link></article>)}</div>
        </section>
      </main>
    </div>
  </div>;
}
