import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { isAdmin } from '../../../../lib/admin-auth';
import { getDb } from '../../../../lib/db';
import { decryptText } from '../../../../lib/secure';
import AdminLogoutButton from '../../AdminLogoutButton';
import CopyButton from '../CopyButton';
import OrderActions from '../OrderActions';

export const dynamic='force-dynamic';

export default async function AdminOrderDetail({params}){
  if(!(await isAdmin())) redirect('/admin/login');
  const {id}=await params;
  const sql=getDb();
  const rows=await sql`SELECT o.*,b.name AS bank_name FROM orders o LEFT JOIN banks b ON b.id=o.bank_id WHERE o.id=${id} AND o.deleted_at IS NULL`;
  if(!rows.length) notFound();
  const o=rows[0];
  const items=await sql`SELECT oi.*,p.name AS product_name FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE oi.order_id=${id} ORDER BY oi.id`;
  const history=await sql`SELECT * FROM order_history WHERE order_id=${id} ORDER BY created_at DESC`;
  const phone=decryptText(o.phone_encrypted);
  const account=decryptText(o.account_number_encrypted);
  const itemData=items.map(x=>({...x,pin:decryptText(x.pin_encrypted)}));

  return <div className="adminPage"><div className="adminTop"><div className="adminBrand">ADMINISTRATOR</div><div className="adminActions"><Link href="/admin/orders">목록</Link><AdminLogoutButton/></div></div><main className="detailMain"><div className="adminTitle"><small>상품권 운영</small><h1>신청 상세</h1><p>접수번호 {o.order_no}</p></div>
    <section className="coreCard"><div className="coreHead"><div><small>가장 먼저 확인하세요</small><h2>입금 · 상품권 핵심정보</h2></div><strong>{Number(o.expected_amount).toLocaleString()}원</strong></div><div className="coreGrid"><div><span>은행</span><b>{o.bank_name||'-'}</b></div><div><span>계좌번호</span><b>{account}</b><CopyButton value={account}/></div><div><span>예금주</span><b>{o.account_holder}</b></div><div><span>연락처</span><b>{phone}</b><CopyButton value={phone}/></div></div>{itemData.map((x)=><div className="giftCore" key={x.id}><div><span>상품권 종류</span><b>{x.product_name}</b></div><div><span>PIN 번호</span><strong>{x.pin}</strong><CopyButton value={x.pin}/></div><div><span>권면금액</span><b>{Number(x.face_value).toLocaleString()}원</b></div><div><span>매입률</span><b>{Number(x.rate_percent).toFixed(0)}%</b></div></div>)}</section>
    <section className="detailGrid"><div className="detailBox"><h3>신청자 정보</h3><p><span>신청자</span><b>{o.customer_name}</b></p><p><span>신청금액</span><b>{Number(o.requested_amount).toLocaleString()}원</b></p><p><span>입금 금액</span><b>{Number(o.expected_amount).toLocaleString()}원</b></p><p><span>실제 입금액</span><b>{Number(o.paid_amount).toLocaleString()}원</b></p></div><OrderActions id={id} initialStatus={o.status} initialPaid={o.paid_amount}/></section>
    <section className="historyBox"><h3>처리 이력</h3>{history.map(h=><div key={h.id}><span>{new Date(h.created_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}</span><b>{h.previous_status||'-'} → {h.new_status}</b><em>{h.reason||''}</em></div>)}</section>
  </main></div>;
}
