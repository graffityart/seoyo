import { getActiveBanks, getActiveProducts, getLiveOrders, getServiceSettings, getActivePopups } from '../lib/db';
import ApplyForm from './components/ApplyForm';
import OrderLookup from './components/OrderLookup';
import SitePopups from './components/SitePopups';

const productImages = {
  cultureland: '/images/products/cultureland.webp',
  'online-culture': '/images/products/online-culture.webp',
  'cultureland-exchange': '/images/products/cultureland-exchange.webp',
  teencash: '/images/products/teencash.webp',
  'booknlife-book': '/images/products/booknlife-book.webp',
  'booknlife-exchange': '/images/products/booknlife-exchange.webp',
  'lotte-mobile': '/images/products/lotte-mobile.webp',
  'google-gift': '/images/products/google-gift.webp',
};

const steps = [
  ['01','https://www.ksdl.kr/images/icon1.png','상품권 선택','보유한 상품권과 현재 매입률을 확인합니다.'],
  ['02','https://www.ksdl.kr/images/icon2.png','신청정보 입력','PIN 번호, 계좌정보와 조회 비밀번호를 입력합니다.'],
  ['03','https://www.ksdl.kr/images/icon3.png','상품권 검수','접수된 PIN의 사용 가능 여부와 권면금액을 확인합니다.'],
  ['04','https://www.ksdl.kr/images/icon4.png','처리 완료','확인 결과에 따라 입금하고 처리상태를 안내합니다.'],
];
const statusLabel={received:'접수중',reviewing:'확인중',checking:'확인중',completed:'입금완료',paid:'입금완료',impossible:'처리불가',rejected:'처리불가'};
function maskName(name=''){const chars=Array.from(name);if(chars.length<=1)return'*';if(chars.length===2)return`${chars[0]}*`;return`${chars[0]}*${chars[chars.length-1]}`;}
export const dynamic='force-dynamic';
export default async function Home(){
 const settings=await getServiceSettings();
 const[products,banks,liveOrders,popups]=await Promise.all([getActiveProducts(),getActiveBanks(),getLiveOrders(settings.liveOrderLimit),getActivePopups(5)]);
 const safeProducts=products.map(p=>({id:Number(p.id),name:p.name,slug:p.slug,default_rate:Number(p.default_rate),imageUrl:p.image_url||productImages[p.slug]||''}));
 const safeBanks=banks.map(b=>({id:Number(b.id),name:b.name,code:b.code}));
 const safePopups=popups.map(p=>({id:Number(p.id),title:p.title||'',content:p.content||'',imageUrl:p.image_url||'',mobileImageUrl:p.mobile_image_url||'',linkUrl:p.link_url||''}));
 const rates=safeProducts.map(p=>[p.name,`${Number(p.default_rate).toFixed(0)}%`,p.imageUrl,p.slug]);
 const now=new Date(),fmt=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'2-digit',month:'2-digit',day:'2-digit',weekday:'short'}).format(now),timeFmt=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
 return <div className="sayo" id="top"><SitePopups popups={safePopups}/><header className="topbar"><div className="shell headerIn"><a className="logo" href="#top"><span className="logoSymbol">S</span><span className="logoText">사요 상품권</span></a><nav><a href="#lookup">내주문조회</a><a href="#rates">상품권매입시세</a><a href="#live">실시간매입현황</a><a href="#guide">이용방법</a><a href="#faq">자주묻는질문</a><a href="#customer">고객센터</a></nav><a className="lookupBtn" href="#lookup">내주문조회</a></div></header><main>
 <section className="heroKsdl"><div className="shell heroShell"><div className="heroCopyKsdl"><h1>쉽고 빠르다! 상품권 서비스</h1><p>고객님의 상품권을 빠르고 간편하게 확인합니다.<br/>별도의 복잡한 절차 없이 신청할 수 있습니다.</p><a href="#apply">상품권 현금교환</a></div><div className="orbitVisual"><div className="phoneMock"><div className="phoneLogo">SAYO</div><b>사요 상품권</b></div>{rates.slice(0,5).map((r,i)=><span className={`orbitCard oc${i+1}`} key={r[0]}>{r[2]&&<img src={r[2]} alt={r[0]}/>}</span>)}</div></div></section>
 <section className="rateSection" id="rates"><div className="shell"><div className="todayTitle"><span>금일</span><b>{fmt}</b><strong>매입률</strong></div><div className="rateGridKsdl">{rates.map(([name,rate,img])=><article key={name}><span className="rateLogo">{img&&<img src={img} alt={name}/>}</span><b>{name}</b><strong>{rate}</strong><a href="#apply">교환하기</a></article>)}</div><p className="dailyNote">✓ {settings.rateNotice}</p></div></section>
 <section id="apply" className="applySection"><div className="shell"><div className="sectionTitle"><p>상품권 현금교환</p><h2>상품권 정보를 입력하고 바로 신청하세요</h2></div><ApplyForm products={safeProducts} banks={safeBanks} settings={settings}/></div></section>
 <section id="lookup" className="lookupSection"><div className="shell"><div className="sectionTitle"><p>내 주문 조회</p><h2>접수번호로 처리상태를 확인하세요</h2></div><OrderLookup/></div></section>
 <section id="live" className="liveSection"><div className="shell"><div className="liveCard"><div className="liveHead"><h2>실시간 진행 현황</h2><div>{fmt}</div></div>{liveOrders.length?<div className="liveRows">{liveOrders.map(o=><div className="liveRow" key={o.order_no}><b>{o.product_names}</b><span>{maskName(o.customer_name)}</span><strong>{Number(o.requested_amount).toLocaleString()}원</strong><span>{statusLabel[o.status]||'처리중'}</span><time>{timeFmt.format(new Date(o.created_at))}</time></div>)}</div>:<div className="liveEmpty">아직 접수된 매입 내역이 없습니다.</div>}</div></div></section>
 <section id="guide" className="guideSection"><div className="shell"><div className="sectionTitle"><p>이용 절차</p><h2>신청부터 입금까지 4단계</h2></div><div className="stepGridKsdl">{steps.map(([n,img,t,d])=><article key={n}><span>{n}</span><div><img src={img} alt={t}/></div><h3>{t}</h3><p>{d}</p></article>)}</div></div></section>
 <section id="faq" className="faqKsdl"><div className="shell"><div className="sectionTitle"><p>이용 전 확인</p><h2>자주 묻는 질문</h2></div><div className="faqListKsdl"><details><summary>회원가입이 필요한가요?</summary><p>별도 회원가입 없이 신청할 수 있습니다.</p></details><details><summary>최소 판매 금액이 있나요?</summary><p>최소 판매금액은 {settings.minimumOrderAmount.toLocaleString()}원 이상입니다.</p></details><details><summary>접수한 주문은 어디에서 확인하나요?</summary><p>접수번호와 조회 비밀번호로 확인할 수 있습니다.</p></details></div></div></section></main>
 <footer id="customer"><div className="shell footerGrid"><div><a className="logo footerLogo" href="#top"><span className="logoSymbol">S</span><span className="logoText">{settings.businessName}</span></a><h3>안전한 접수와 정확한 처리를 약속드립니다.</h3>{settings.customerPhone&&<p>고객센터 {settings.customerPhone}{settings.customerHours&&` · ${settings.customerHours}`}</p>}{settings.customerEmail&&<p>{settings.customerEmail}</p>}</div><div className="business"><h4>사업자 정보</h4><p><span>상호</span><b>{settings.businessName}</b></p>{settings.businessOwner&&<p><span>대표자</span><b>{settings.businessOwner}</b></p>}{settings.businessNumber&&<p><span>사업자등록번호</span><b>{settings.businessNumber}</b></p>}{settings.businessAddress&&<p><span>주소</span><b>{settings.businessAddress}</b></p>}<p><span>도메인</span><b>seoyo.kr</b></p><p><a href="/terms">이용약관</a> · <a href="/privacy">개인정보처리방침</a></p></div></div></footer></div>;
}
