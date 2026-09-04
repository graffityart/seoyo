import { getActiveBanks, getActiveProducts, getLiveOrders, getServiceSettings, getActivePopups } from '../lib/db';
import ApplyForm from './components/ApplyForm';
import OrderLookup from './components/OrderLookup';
import SitePopups from './components/SitePopups';

const productImages = {
  cultureland: 'https://www.ksdl.kr/images/hero-orbit/01_cultureland.png',
  'online-culture': 'https://www.ksdl.kr/images/hero-orbit/01_cultureland.png',
  'cultureland-exchange': 'https://www.ksdl.kr/images/hero-orbit/01_cultureland.png',
  teencash: 'https://www.ksdl.kr/images/hero-orbit/02_tincash.png',
  'booknlife-book': 'https://www.ksdl.kr/images/hero-orbit/04_booknlife.png',
  'booknlife-exchange': 'https://www.ksdl.kr/images/hero-orbit/04_booknlife.png',
  'lotte-mobile': 'https://www.ksdl.kr/images/hero-orbit/05_lotte.png',
  'google-gift': 'https://www.ksdl.kr/images/hero-orbit/03_googleplay.png',
};

const steps = [
  ['01','https://www.ksdl.kr/images/icon1.png','상품권 선택','보유한 상품권과 현재 매입률을 확인합니다.'],
  ['02','https://www.ksdl.kr/images/icon2.png','신청정보 입력','PIN 번호, 계좌정보와 조회 비밀번호를 입력합니다.'],
  ['03','https://www.ksdl.kr/images/icon3.png','상품권 검수','접수된 PIN의 사용 가능 여부와 권면금액을 확인합니다.'],
  ['04','https://www.ksdl.kr/images/icon4.png','처리 완료','확인 결과에 따라 입금하고 처리상태를 안내합니다.'],
];

const statusLabel = {
  received: '접수중', reviewing: '확인중', checking: '확인중', completed: '입금완료', paid: '입금완료', impossible: '처리불가', rejected: '처리불가',
};

function maskName(name='') {
  const chars = Array.from(name);
  if (chars.length <= 1) return '*';
  if (chars.length === 2) return `${chars[0]}*`;
  return `${chars[0]}*${chars[chars.length-1]}`;
}

export const dynamic = 'force-dynamic';

export default async function Home(){
  const settings = await getServiceSettings();
  const [products, banks, liveOrders, popups] = await Promise.all([getActiveProducts(), getActiveBanks(), getLiveOrders(settings.liveOrderLimit), getActivePopups(5)]);
  const safeProducts = products.map((p)=>({ id:Number(p.id), name:p.name, slug:p.slug, default_rate:Number(p.default_rate) }));
  const safeBanks = banks.map((b)=>({ id:Number(b.id), name:b.name, code:b.code }));
  const safePopups = popups.map(p=>({id:Number(p.id),title:p.title||'',content:p.content||'',imageUrl:p.image_url||'',mobileImageUrl:p.mobile_image_url||'',linkUrl:p.link_url||''}));
  const rates = safeProducts.map((p) => [p.name, `${Number(p.default_rate).toFixed(0)}%`, productImages[p.slug] || '', p.slug]);
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'2-digit',month:'2-digit',day:'2-digit',weekday:'short'}).format(now);
  const timeFmt = new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
  return <div className="sayo" id="top">
    <SitePopups popups={safePopups}/>
    <header className="topbar"><div className="shell headerIn"><a className="logo" href="#top"><span className="logoSymbol">S</span><span className="logoText">사요 상품권</span></a><nav><a href="#lookup">내주문조회</a><a href="#rates">상품권매입시세</a><a href="#live">실시간매입현황</a><a href="#guide">이용방법</a><a href="#faq">자주묻는질문</a><a href="#customer">고객센터</a></nav><a className="lookupBtn" href="#lookup">내주문조회</a></div></header>
    <main>
      <section className="heroKsdl"><div className="shell heroShell"><div className="heroCopyKsdl"><h1>쉽고 빠르다! 상품권 서비스</h1><p>고객님의 상품권을 빠르고 간편하게 확인합니다.<br/>별도의 복잡한 절차 없이 신청할 수 있습니다.</p><a href="#apply">상품권 현금교환</a></div><div className="orbitVisual"><div className="phoneMock"><div className="phoneLogo">SAYO</div><div className="phoneLine"></div><b>사요 상품권</b><small>배너 이미지는 신규 이미지로 교체 예정</small></div>{rates.slice(0,5).map((r,i)=><span className={`orbitCard oc${i+1}`} key={r[0]}>{r[2] && <img src={r[2]} alt={r[0]}/>}</span>)}</div></div></section>
      <section className="rateSection" id="rates"><div className="shell"><div className="todayTitle"><span>금일</span><b>{fmt}</b><strong>매입률</strong></div><div className="rateGridKsdl">{rates.map(([name,rate,img])=><article key={name}><span className="rateLogo">{img && <img src={img} alt={name}/>}</span><b>{name}</b><strong>{rate}</strong><button>교환하기</button></article>)}</div><p className="dailyNote">✓ {settings.rateNotice}</p></div></section>
      <section id="apply" className="applySection"><div className="shell"><div className="sectionTitle"><p>상품권 현금교환</p><h2>상품권 정보를 입력하고 바로 신청하세요</h2><span>상품권 선택부터 PIN·계좌정보·조회 비밀번호까지 한 번에 접수할 수 있습니다.</span></div><ApplyForm products={safeProducts} banks={safeBanks} settings={settings}/></div></section>
      <section id="lookup" className="lookupSection"><div className="shell"><div className="sectionTitle"><p>내 주문 조회</p><h2>접수번호로 처리상태를 확인하세요</h2><span>신청 완료 시 받은 접수번호와 조회 비밀번호로 안전하게 확인할 수 있습니다.</span></div><OrderLookup/></div></section>
      <section id="live" className="liveSection"><div className="shell"><div className="liveCard"><div className="liveHead"><div><span className="liveIcon">▣</span><div><h2>실시간 진행 현황</h2><p>최근 매입 현황입니다</p></div></div><div className="liveDate"><i></i>{fmt}</div></div>{liveOrders.length ? <div className="liveRows">{liveOrders.map((o)=><div className="liveRow" key={o.order_no}><div className="liveProduct"><b>{o.product_names}</b><span>{Number(o.item_count).toLocaleString()}건</span></div><div className="liveCustomer">{maskName(o.customer_name)}</div><div className="liveAmount">{Number(o.requested_amount).toLocaleString()}원</div><div className={`liveStatus status-${o.status}`}>{statusLabel[o.status] || '처리중'}</div><time>{timeFmt.format(new Date(o.created_at))}</time></div>)}</div> : <div className="liveEmpty">아직 접수된 매입 내역이 없습니다.</div>}<div className="liveFoot">개인정보 보호를 위해 신청자명은 일부 마스킹되어 표시됩니다.</div></div></div></section>
      <section id="guide" className="guideSection"><div className="shell"><div className="sectionTitle"><p>이용 절차</p><h2>신청부터 입금까지 4단계</h2><span>처음 이용해도 순서대로 진행하면 어렵지 않습니다.</span></div><div className="stepGridKsdl">{steps.map(([n,img,t,d])=><article key={n}><span>{n}</span><div><img src={img} alt={t}/></div><h3>{t}</h3><p>{d}</p></article>)}</div></div></section>
      <section id="faq" className="faqKsdl"><div className="shell"><div className="sectionTitle"><p>이용 전 확인</p><h2>자주 묻는 질문</h2></div><div className="faqListKsdl"><details><summary>회원가입이 필요한가요?</summary><p>별도 회원가입 없이 신청할 수 있습니다.</p></details><details><summary>최소 판매 금액이 있나요?</summary><p>최소 판매금액은 {settings.minimumOrderAmount.toLocaleString()}원 이상입니다.</p></details><details><summary>접수한 주문은 어디에서 확인하나요?</summary><p>상단 내주문조회에서 접수번호와 신청 시 설정한 조회 비밀번호를 입력하면 현재 처리상태를 확인할 수 있습니다.</p></details></div></div></section>
    </main>
    <footer id="customer"><div className="shell footerGrid"><div><a className="logo footerLogo" href="#top"><span className="logoSymbol">S</span><span className="logoText">사요 상품권</span></a><h3>안전한 접수와 정확한 처리를 약속드립니다.</h3></div><div className="business"><h4>사업자 정보</h4><p><span>상호</span><b>사요 상품권</b></p><p><span>도메인</span><b>seoyo.kr</b></p></div></div></footer>
  </div>;
}
