import Link from 'next/link';

export const cashMenuItems=[
  {slug:'cultureland',label:'컬쳐랜드현금화'},
  {slug:'online-culture',label:'온라인문화상품권현금화'},
  {slug:'teencash',label:'틴캐시 현금화'},
  {slug:'booknlife',label:'북앤라이프 현금화'},
  {slug:'lotte-mobile',label:'롯데 모바일상품권 현금화'},
  {slug:'google-giftcard',label:'구글 기프트카드 현금화'}
];

export default function ProductCashMenu(){
  return <div className="cashNavMenu">
    <button type="button" className="cashNavTrigger">각상품권별 매입신청 <span>▾</span></button>
    <div className="cashNavDropdown">
      {cashMenuItems.map(item=><Link key={item.slug} href={`/cash/${item.slug}`}>{item.label}</Link>)}
    </div>
  </div>
}
