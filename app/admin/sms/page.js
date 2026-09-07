import Link from 'next/link';
import {redirect} from 'next/navigation';
import {isAdmin} from '../../../lib/admin-auth';
import {getIcodeConfigState,getSmsLogs,getSmsSettings} from '../../../lib/icode';
import AdminLogoutButton from '../AdminLogoutButton';
import SmsEditor from './SmsEditor';
export const dynamic='force-dynamic';
export default async function AdminSmsPage(){
  if(!(await isAdmin()))redirect('/admin/login');
  const [settings,logs]=await Promise.all([getSmsSettings(),getSmsLogs(50)]);
  const safeLogs=logs.map(x=>({id:Number(x.id),recipient_type:x.recipient_type,event_type:x.event_type,phone_last4:x.recipient_phone_last4,status:x.send_status,result_code:x.result_code,message:x.message_content,created_at:new Date(x.created_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}));
  return <div className="adminPage"><div className="adminTop"><div className="adminBrand">ADMINISTRATOR</div><div className="adminActions"><a href="/" target="_blank">사이트 보기</a><AdminLogoutButton/></div></div><div className="adminWrap"><aside className="adminSide"><h3>상품권 운영 관리</h3><Link href="/admin/orders">교환신청 관리</Link><Link href="/admin/products">상품권 관리</Link><Link href="/admin/rates">상품권 매입률 관리</Link><Link href="/admin/settings">서비스 운영 설정</Link><Link href="/admin/notices">공지사항 관리</Link><Link href="/admin/popups">팝업 관리</Link><Link className="active" href="/admin/sms">문자 발송 관리</Link></aside><main className="adminMain"><div className="adminTitle"><small>MESSAGE MANAGEMENT</small><h1>문자 발송 관리</h1><p>아이코드 발송 설정, 상태별 문구, 테스트 발송과 최근 발송 결과를 관리합니다.</p></div><SmsEditor initial={settings} configState={getIcodeConfigState()}/><section className="smsLogCard"><div className="smsLogHead"><h2>최근 발송 내역</h2><span>최근 50건</span></div><div className="smsLogTable"><div className="smsLogRow head"><span>일시</span><span>대상</span><span>유형</span><span>번호</span><span>상태</span><span>코드</span><span>내용</span></div>{safeLogs.length?safeLogs.map(x=><div className="smsLogRow" key={x.id}><span>{x.created_at}</span><span>{x.recipient_type==='admin'?'관리자':'고객'}</span><span>{x.event_type}</span><span>***-{x.phone_last4}</span><span className={`smsState ${x.status}`}>{x.status}</span><span>{x.result_code||'-'}</span><span title={x.message}>{x.message}</span></div>):<div className="smsLogEmpty">아직 문자 발송 내역이 없습니다.</div>}</div></section></main></div></div>
}
