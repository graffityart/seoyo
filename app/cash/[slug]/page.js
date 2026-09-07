import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getActiveBanks, getActiveProducts, getServiceSettings } from '../../../lib/db';
import BrandLogo from '../../components/BrandLogo';
import ApplyForm from '../../components/ApplyForm';
import ProductCashMenu, { cashMenuItems } from '../../components/ProductCashMenu';
import MobileMenu from '../../components/MobileMenu';

const productImages={cultureland:'/images/products/%EC%BB%AC%EC%B3%90%EB%9E%9C%EB%93%9C%20%EB%AC%B8%ED%99%94%EC%83%81%ED%92%88%EA%B6%8C.svg','online-culture':'/images/products/%EC%98%A8%EB%9D%BC%EC%9D%B8%EB%AC%B8%ED%99%94%EC%83%81%ED%92%88%EA%B6%8C.jpg',teencash:'/images/products/%ED%8B%B4%EC%BA%90%EC%8B%9C.png','booknlife-book':'/images/products/%EB%B6%81%EC%95%A4%EB%9D%BC%EC%9D%B4%ED%94%84%20%EB%8F%84%EC%84%9C%EB%AC%B8%ED%99%94%EC%83%81%ED%92%88%EA%B6%8C.svg','lotte-mobile':'/images/products/%EB%A1%AF%EB%8D%B0%EB%AA%A8%EB%B0%94%EC%9D%BC%EC%83%81%ED%92%88%EA%B6%8C.png','google-gift':'/images/products/%EA%B5%AC%EA%B8%80%EA%B8%B8%ED%94%84%ED%8A%B8%20%EC%B9%B4%EB%93%9C.svg'};

const pages={
  cultureland:{title:'컬쳐랜드 현금화',seoTitle:'컬쳐랜드 현금화ㅣ컬쳐랜드 문화상품권 매입·현금교환 | 사요 상품권',productSlug:'cultureland',description:'컬쳐랜드 현금화와 컬쳐랜드 문화상품권 매입을 간편하게 신청하세요. 현재 매입률을 확인하고 상품권 PIN과 입금 계좌를 입력하면 빠르게 접수할 수 있습니다.',keyword:'컬쳐랜드 현금화',keywords:['컬쳐랜드 현금화','컬쳐랜드 매입','컬쳐랜드 문화상품권 매입','컬쳐랜드 현금교환']},intro:'컬쳐랜드 문화상품권의 현재 매입률과 PIN 입력방법을 확인하고 바로 현금화 신청할 수 있습니다.'},
  'online-culture':{title:'온라인문화상품권 현금화',seoTitle:'온라인문화상품권 현금화ㅣ온라인 문화상품권 매입 | 사요 상품권',productSlug:'online-culture',description:'온라인문화상품권 현금화 및 매입 신청 페이지입니다. 현재 온라인 문화상품권 매입률과 PIN 입력방법을 확인하고 간편하게 현금교환을 신청하세요.',keyword:'온라인문화상품권 현금화',keywords:['온라인문화상품권 현금화','온라인문화상품권 매입','온라인 문화상품권 현금교환']},intro:'온라인문화상품권의 매입률과 PIN 입력 형식을 확인한 뒤 전용 신청폼에서 바로 접수할 수 있습니다.'},
  teencash:{title:'틴캐시 현금화',seoTitle:'틴캐시 현금화ㅣ틴캐시 상품권 매입·현금교환 | 사요 상품권',productSlug:'teencash',description:'틴캐시 현금화와 틴캐시 상품권 매입을 간편하게 신청하세요. 현재 매입률과 PIN 입력방법을 확인하고 입금받을 계좌로 현금교환을 신청할 수 있습니다.',keyword:'틴캐시 현금화',keywords:['틴캐시 현금화','틴캐시 매입','틴캐시 상품권 매입','틴캐시 현금교환']},intro:'틴캐시 상품권의 현재 매입률을 확인하고 PIN과 계좌정보를 입력해 간편하게 현금화 신청하세요.'},
  booknlife:{title:'북앤라이프 현금화',seoTitle:'북앤라이프 현금화ㅣ도서문화상품권 매입·현금교환 | 사요 상품권',productSlug:'booknlife-book',description:'북앤라이프 현금화와 도서문화상품권 매입을 간편하게 신청하세요. 현재 매입률과 상품권 PIN 입력방법을 확인하고 안전하게 현금교환을 접수할 수 있습니다.',keyword:'북앤라이프 현금화',keywords:['북앤라이프 현금화','도서문화상품권 현금화','북앤라이프 매입','도서문화상품권 매입']},intro:'북앤라이프 도서문화상품권의 매입률과 PIN 입력방법을 확인하고 전용 신청폼에서 현금교환을 접수하세요.'},
  'lotte-mobile':{title:'롯데 모바일상품권 현금화',seoTitle:'롯데 모바일상품권 현금화ㅣ롯데상품권 매입 | 사요 상품권',productSlug:'lotte-mobile',description:'롯데 모바일상품권 현금화 및 매입 신청 페이지입니다. 현재 매입률과 교환권 입력방법을 확인하고 간편하게 상품권 현금교환을 신청하세요.',keyword:'롯데 모바일상품권 현금화',keywords:['롯데 모바일상품권 현금화','롯데 모바일상품권 매입','롯데상품권 현금화','롯데상품권 매입']},intro:'롯데 모바일상품권의 현재 매입률과 입력방법을 확인하고 전용 신청폼에서 바로 현금화 신청할 수 있습니다.'},
  'google-giftcard':{title:'구글 기프트카드 현금화',seoTitle:'구글 기프트카드 현금화ㅣ구글 상품권 매입·현금교환 | 사요 상품권',productSlug:'google-gift',description:'구글 기프트카드 현금화와 상품권 매입을 간편하게 신청하세요. 현재 매입률과 교환권 입력방법을 확인하고 입금받을 계좌로 현금교환을 신청할 수 있습니다.',keyword:'구글 기프트카드 현금화',keywords:['구글 기프트카드 현금화','구글 기프트카드 매입','구글 상품권 현금화','구글 기프트카드 현금교환']},intro:'구글 기프트카드의 현재 매입률과 입력방법을 확인한 뒤 전용 신청폼을 이용해 현금교환을 신청하세요.'}
};

export function generateStaticParams(){return Object.keys(pages).map(slug=>({slug}))}
export async function generateMetadata({params}){const {slug}=await params;const page=pages[slug];if(!page)return{};return {title:page.seoTitle,description:page.description,keywords:page.keywords,alternates:{canonical:`/cash/${slug}`},robots:{index:true,follow:true},openGraph:{title:page.seoTitle,description:page.description,url:`/cash/${slug}`,siteName:'사요 상품권',locale:'ko_KR',type:'website'},twitter:{card:'summary_large_image',title:page.seoTitle,description:page.description}}}

export default async function CashPage({params}){
  const {slug}=await params;const page=pages[slug];if(!page)notFound();
  const [products,banks,settings]=await Promise.all([getActiveProducts(),getActiveBanks(),getServiceSettings()]);
  const rawProduct=products.find(p=>p.slug===page.productSlug);
  const matched=rawProduct?[{id:Number(rawProduct.id),name:rawProduct.name,slug:rawProduct.slug,default_rate:Number(rawProduct.default_rate),imageUrl:productImages[rawProduct.slug]||rawProduct.image_url||''}]:[];
  const safeBanks=banks.map(b=>({id:Number(b.id),name:b.name,code:b.code}));
  return <div className="sayo cashLanding" id="top">
    <header className="topbar"><div className="shell headerIn"><Link className="logo imageLogo" href="/"><BrandLogo/></Link><nav><Link href="/#rates">상품권매입시세</Link><Link href="/live">실시간매입현황</Link><Link href="/#guide">이용방법</Link><ProductCashMenu/><Link href="/#faq">자주묻는질문</Link><Link href="/#customer">고객센터</Link></nav><Link className="lookupBtn" href="/#lookup">내주문조회</Link><MobileMenu/></div></header>
    <main>
      <section className="cashHero"><div className="shell"><p>GIFT CARD CASH SERVICE</p><h1>{page.title}</h1><span>{page.description}</span><Link href="#cash-apply">{page.title} 신청하기</Link></div></section>
      <section id="cash-apply" className="cashApplySection"><div className="shell"><div className="cashApplyHeading"><p>바로 신청</p><h2>{page.title} 매입 신청</h2><span>{page.intro}</span></div>{matched.length?<ApplyForm products={matched} banks={safeBanks} settings={settings}/>:<div className="cashApplyUnavailable">현재 해당 상품권의 접수가 일시 중지되어 있습니다. 메인 매입시세를 확인해 주세요.</div>}</div></section>
      <section className="cashInfoSection"><div className="shell"><div className="cashInfoGrid"><article><small>현재 매입 정보</small><h2>{page.title} 매입 안내</h2>{matched.length?<div className="cashRateList">{matched.map(p=><div key={p.id}><span>{p.name}</span><strong>{Number(p.default_rate).toFixed(0)}% 매입</strong></div>)}</div>:<p>현재 매입률은 메인 상품권 매입시세에서 확인할 수 있습니다.</p>}<Link href="/#rates">전체 매입시세 확인</Link></article><article><small>신청 방법</small><h2>{page.keyword} 신청 방법</h2><ol><li>위 전용 신청폼에서 상품권 PIN을 입력합니다.</li><li>상품권 금액을 입력하고 상품권을 추가합니다.</li><li>입금 받을 계좌와 연락처를 입력합니다.</li><li>신청 완료 후 처리 상태를 확인합니다.</li></ol><Link href="#cash-apply">전용 신청폼으로 이동</Link></article></div></div></section>
      <section className="cashSeoSection"><div className="shell"><h2>{page.keyword} 이용 안내</h2><p>{page.intro} 이 페이지에서는 해당 상품권의 매입 정보와 신청 절차를 한곳에서 확인할 수 있으며, 다른 상품권을 별도로 선택할 필요 없이 해당 상품권 전용 신청폼을 이용할 수 있습니다.</p><p>신청 전 상품권 번호와 금액을 다시 확인하고 정확한 계좌정보와 연락처를 입력해 주세요. 접수 후 처리 상태는 메인 화면의 내 주문 조회에서 전화번호와 조회 비밀번호로 확인할 수 있습니다.</p><div className="cashSiblingLinks">{cashMenuItems.filter(x=>x.slug!==slug).map(item=><Link href={`/cash/${item.slug}`} key={item.slug}>{item.label}</Link>)}</div></div></section>
    </main>
    <footer id="customer"><div className="shell footerGrid"><div><Link className="logo footerLogo imageLogo" href="/"><BrandLogo className="footerBrandLogo"/></Link><h3>안전한 접수와 정확한 처리를 약속드립니다.</h3>{settings.customerPhone&&<p>고객센터 {settings.customerPhone}{settings.customerHours&&` · ${settings.customerHours}`}</p>}</div><div className="business"><h4>사업자 정보</h4><p><span>상호</span><b>{settings.businessName}</b></p>{settings.businessOwner&&<p><span>대표자</span><b>{settings.businessOwner}</b></p>}{settings.businessNumber&&<p><span>사업자등록번호</span><b>{settings.businessNumber}</b></p>}<p><span>도메인</span><b>seoyo.kr</b></p><p><Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보처리방침</Link></p></div></div></footer>
  </div>
}