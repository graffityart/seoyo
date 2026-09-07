import Link from 'next/link';
import BrandLogo from './BrandLogo';

export default function SiteFooter(){
  return <footer id="customer" className="siteFooter">
    <div className="shell siteFooterInner">
      <div className="siteFooterBrand">
        <Link className="logo footerLogo imageLogo" href="/"><BrandLogo className="footerBrandLogo"/></Link>
        <p className="footerPromise">빠르고 안전한 상품권 매입 서비스를 제공합니다.</p>
      </div>
      <div className="footerBusinessInfo">
        <h4>사업자 정보</h4>
        <div className="footerInfoRows">
          <p><span>상호</span><b>사요 상품권(핀토스)</b></p>
          <p><span>대표</span><b>조문국</b></p>
          <p className="footerAddress"><span>주소</span><b>(47190) 부산광역시 부산진구 당감로17, 7동 906호(당감동)</b></p>
          <p><span>사업자등록번호</span><b>590-95-01527</b></p>
          <p><span>통신판매번호</span><b>2024-부산진-1016</b></p>
          <p><span>Email</span><a href="mailto:admin@pin-toss.com">admin@pin-toss.com</a></p>
        </div>
        <div className="footerPolicyLinks"><Link href="/terms">이용약관</Link><i/> <Link href="/privacy">개인정보처리방침</Link></div>
      </div>
    </div>
    <div className="shell footerCopyright">© 사요 상품권(핀토스). All rights reserved.</div>
  </footer>
}
