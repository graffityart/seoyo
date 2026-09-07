import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getActiveProducts, getServiceSettings } from '../../../lib/db';
import BrandLogo from '../../components/BrandLogo';
import ProductCashMenu, { cashMenuItems } from '../../components/ProductCashMenu';

const pages={
  cultureland:{title:'컬쳐랜드현금화',productNames:['컬쳐랜드 문화상품권','컬쳐랜드 교환권'],description:'컬쳐랜드 상품권을 간편하게 현금화 신청할 수 있는 사요 상품권 안내 페이지입니다.',keyword:'컬쳐랜드현금화'},
  'online-culture':{title:'온라인문화상품권현금화',productNames:['온라인 문화상품권'],description:'온라인문화상품권 현금화 신청 방법과 현재 매입 정보를 확인하세요.',keyword:'온라인문화상품권현금화'},
  teencash:{title:'틴캐시 현금화',productNames:['틴캐시 상품권'],description:'틴캐시 상품권 현금화 신청을 위한 기본 안내와 매입 정보를 제공합니다.',keyword:'틴캐시 현금화'},
  booknlife:{title:'북앤라이프 현금화',productNames:['북앤라이프 도서문화상품권','북앤라이프 교환권'],description:'북앤라이프 도서문화상품권과 교환권 현금화 신청 안내 페이지입니다.',keyword:'북앤라이프 현금화'},
  'lotte-mobile':{title:'롯데 모바일상품권 현금화',productNames:['롯데 모바일상품권'],description:'롯데 모바일상품권 현금화 신청과 현재 매입 정보를 확인하세요.',keyword:'롯데 모바일상품권 현금화'},
  'google-giftcard':{title:'구글 기프트카드 현금화',productNames:['구글 기프트카드'],description:'구글 기프트카드 현금화 신청을 위한 기본 안내와 매입 정보를 제공합니다.',keyword:'구글 기프트카드 현금화'}
};

export function generateStaticParams(){return Object.keys(pages).map(slug=>({slug}))}
export async function generateMetadata({params}){const {slug}=await params;const page=pages[slug];if(!page)return{};return {title:`${page.title} | 사요 상품권`,description:page.description,keywords:[page.keyword,'상품권 현금화','상품권 매입','사요 상품권'],alternates:{canonical:`/cash/${slug}`},openGraph:{title:`${page.title} | 사요 상품권`,description:page.description,url:`/cash/${slug}`,type:'website'}}}

export default async function CashPage({params}){
  const {slug}=await params;const page=pages[slug];if(!page)notFound();
  const [products,settings]=await Promise.all([getActiveProducts(),getServiceSettings()]);
  const matched=products.filter(p=>page.productNames.some(name=>String(p.name).includes(name)||name.includes(String(p.name))));
  return <div className="sayo cashLanding" id="top">
    <header className="topbar"><div className="shell headerIn"><Link className="logo imageLogo" href="/"><BrandLogo/></Link><nav><Link href="/#rates">상품권매입시세</Link><Link href="/live">실시간매입현황</Link><Link href="/#guide">이용방법</Link><ProductCashMenu/><Link href="/#faq">자주묻는질문</Link><Link href="/#customer">고객센터</Link></nav><Link className="lookupBtn" href="/#lookup">내주문조회</Link></div></header>
    <main>
      <section className="cashHero"><div className="shell"><p>GIFT CARD CASH SERVICE</p><h1>{page.title}</h1><span>{page.description}</span><Link href="/#apply">상품권 매입 신청하기</Link></div></section>
      <section className="cashInfoSection"><div className="shell"><div className="cashInfoGrid"><article><small>현재 매입 정보</small><h2>{page.title} 매입 안내</h2>{matched.length?<div className="cashRateList">{matched.map(p=><div key={p.id}><span>{p.name}</span><strong>{Number(p.default_rate).toFixed(0)}% 매입</strong></div>)}</div>:<p>현재 매입률은 메인 상품권 매입시세에서 확인할 수 있습니다.</p>}<Link href="/#rates">전체 매입시세 확인</Link></article><article><small>신청 방법</small><h2>간편하게 신청하세요</h2><ol><li>상품권 종류를 선택합니다.</li><li>상품권 PIN과 금액을 입력합니다.</li><li>입금 받을 계좌와 연락처를 입력합니다.</li><li>검수 완료 후 입금 상태를 확인합니다.</li></ol><Link href="/#apply">바로 신청하기</Link></article></div></div></section>
      <section className="cashSeoSection"><div className="shell"><h2>{page.keyword} 이용 안내</h2><p>{page.title} 페이지는 해당 상품권을 판매하려는 이용자가 매입률과 신청 절차를 빠르게 확인할 수 있도록 구성했습니다. 실제 접수는 사요 상품권 메인 신청폼에서 진행되며, 상품권 종류별 입력 형식과 현재 매입률이 자동으로 반영됩니다.</p><p>상품권 번호는 신청 전에 다시 확인해 주시고, 정확한 계좌정보와 연락처를 입력해 주세요. 처리 상태는 메인 화면의 내 주문 조회에서 전화번호와 조회 비밀번호로 확인할 수 있습니다.</p><div className="cashSiblingLinks">{cashMenuItems.filter(x=>x.slug!==slug).map(item=><Link href={`/cash/${item.slug}`} key={item.slug}>{item.label}</Link>)}</div></div></section>
    </main>
    <footer id="customer"><div className="shell footerGrid"><div><Link className="logo footerLogo imageLogo" href="/"><BrandLogo className="footerBrandLogo"/></Link><h3>안전한 접수와 정확한 처리를 약속드립니다.</h3>{settings.customerPhone&&<p>고객센터 {settings.customerPhone}{settings.customerHours&&` · ${settings.customerHours}`}</p>}</div><div className="business"><h4>사업자 정보</h4><p><span>상호</span><b>{settings.businessName}</b></p>{settings.businessOwner&&<p><span>대표자</span><b>{settings.businessOwner}</b></p>}{settings.businessNumber&&<p><span>사업자등록번호</span><b>{settings.businessNumber}</b></p>}<p><span>도메인</span><b>seoyo.kr</b></p><p><Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보처리방침</Link></p></div></div></footer>
  </div>
}
