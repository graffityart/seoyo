import Link from 'next/link';
import { getActiveProducts, getLiveOrders, getServiceSettings } from '../../lib/db';

const productImages={cultureland:'/images/products/%EC%BB%AC%EC%B3%90%EB%9E%9C%EB%93%9C%20%EB%AC%B8%ED%99%94%EC%83%81%ED%92%88%EA%B6%8C.svg','online-culture':'/images/products/%EC%98%A8%EB%9D%BC%EC%9D%B8%EB%AC%B8%ED%99%94%EC%83%81%ED%92%88%EA%B6%8C.jpg','cultureland-exchange':'/images/products/%EC%BB%AC%EC%B3%90%EB%9E%9C%EB%93%9C%20%EA%B5%90%ED%99%98%EA%B6%8C.png',teencash:'/images/products/%ED%8B%B4%EC%BA%90%EC%8B%9C.png','booknlife-book':'/images/products/%EB%B6%81%EC%95%A4%EB%9D%BC%EC%9D%B4%ED%94%84%20%EB%8F%84%EC%84%9C%EB%AC%B8%ED%99%94%EC%83%81%ED%92%88%EA%B6%8C.svg','booknlife-exchange':'/images/products/%EB%B6%81%EC%95%A4%EB%9D%BC%EC%9D%B4%ED%94%84%20%EB%8F%84%EC%84%9C%EB%AC%B8%ED%99%94%EC%83%81%ED%92%88%EA%B6%8C.svg','lotte-mobile':'/images/products/%EB%A1%AF%EB%8D%B0%EB%AA%A8%EB%B0%94%EC%9D%BC%EC%83%81%ED%92%88%EA%B6%8C.png','google-gift':'/images/products/%EA%B5%AC%EA%B8%80%EA%B8%B8%ED%94%84%ED%8A%B8%20%EC%B9%B4%EB%93%9C.svg'};
const statusLabel={received:'접수중',reviewing:'확인중',checking:'확인중',completed:'입금완료',paid:'입금완료',impossible:'처리불가',rejected:'처리불가'};

export const dynamic='force-dynamic';
export const metadata={title:'실시간 매입 현황 | 사요 상품권',description:'사요 상품권의 최근 상품권 매입 진행 현황을 확인하세요.',alternates:{canonical:'/live'}};

export default async function LivePage(){
  const [settings,products,orders]=await Promise.all([getServiceSettings(),getActiveProducts(),getLiveOrders(100)]);
  const mapped=orders.map(o=>{
    const product=products.find(p=>String(o.product_names||'').includes(p.name));
    return {orderNo:o.order_no,name:o.product_names||'상품권',count:Number(o.item_count||1),customer:o.customer_name||'',status:o.status,imageUrl:productImages[product?.slug]||product?.image_url||'',createdAt:o.created_at};
  });
  return <div className="sayo livePage" id="top">
    <header className="topbar"><div className="shell headerIn"><Link className="logo" href="/"><span className="logoSymbol">S</span><span className="logoText">사요 상품권</span></Link><nav><Link href="/#lookup">내주문조회</Link><Link href="/#rates">상품권매입시세</Link><Link href="/live">실시간매입현황</Link><Link href="/#guide">이용방법</Link><Link href="/#faq">자주묻는질문</Link><Link href="/#customer">고객센터</Link></nav><Link className="lookupBtn" href="/#lookup">내주문조회</Link></div></header>
    <main>
      <section className="liveHero"><div className="shell"><p>REAL-TIME STATUS</p><h1>실시간 매입 현황</h1><span>최근 접수된 상품권의 처리 상태를 한눈에 확인하세요.</span></div></section>
      <section className="livePageSection"><div className="shell">
        <div className="livePageIntro"><div><span className="livePageIcon">◷</span><div><h2>최근 매입 진행현황</h2><p>접수된 순서대로 최신 내역이 표시됩니다.</p></div></div><span className="livePulse"><i/> 실시간 업데이트</span></div>
        <div className="liveTableCard">
          <div className="liveTableHead"><span>상품권</span><span>신청자</span><span>수량</span><span>상태</span><span>접수시간</span></div>
          {mapped.length?<div className="liveTableBody">{mapped.map((o,i)=><div className="liveTableRow" key={`${o.orderNo}-${i}`}><div className="liveProductCell"><span className="liveProductLogo">{o.imageUrl?<img src={o.imageUrl} alt=""/>:'🎫'}</span><strong>{o.name}</strong></div><span className="liveCustomer">{maskName(o.customer)}</span><span className="liveCount">{o.count}건</span><span><b className={`liveStatus status-${o.status||'received'}`}>{statusLabel[o.status]||'처리중'}</b></span><time>{formatDate(o.createdAt)}</time></div>)}</div>:<div className="livePageEmpty">현재 표시할 매입 내역이 없습니다.</div>}
        </div>
        <div className="livePageGuide"><strong>내 신청내역이 궁금하신가요?</strong><p>메인 화면의 내 주문 조회에서 접수 시 입력한 전화번호와 조회 비밀번호로 확인할 수 있습니다.</p><Link href="/#lookup">내 주문 조회하기 →</Link></div>
      </div></section>
    </main>
    <footer id="customer"><div className="shell footerGrid"><div><Link className="logo footerLogo" href="/"><span className="logoSymbol">S</span><span className="logoText">{settings.businessName}</span></Link><h3>안전한 접수와 정확한 처리를 약속드립니다.</h3>{settings.customerPhone&&<p>고객센터 {settings.customerPhone}{settings.customerHours&&` · ${settings.customerHours}`}</p>}</div><div className="business"><h4>사업자 정보</h4><p><span>상호</span><b>{settings.businessName}</b></p>{settings.businessOwner&&<p><span>대표자</span><b>{settings.businessOwner}</b></p>}{settings.businessNumber&&<p><span>사업자등록번호</span><b>{settings.businessNumber}</b></p>}<p><span>도메인</span><b>seoyo.kr</b></p><p><Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보처리방침</Link></p></div></div></footer>
  </div>
}
function maskName(name=''){const c=Array.from(name);if(c.length<=1)return'*';if(c.length===2)return`${c[0]}*`;return`${c[0]}*${c[c.length-1]}`}
function formatDate(value){try{return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value))}catch{return''}}
