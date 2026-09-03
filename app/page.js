const rates = [
  ['컬쳐랜드 문화상품권', '90%', 'https://www.ksdl.kr/images/hero-orbit/01_cultureland.png'],
  ['온라인 문화상품권', '90%', 'https://www.ksdl.kr/images/hero-orbit/01_cultureland.png'],
  ['컬쳐랜드 교환권', '90%', 'https://www.ksdl.kr/images/hero-orbit/01_cultureland.png'],
  ['틴캐시 상품권', '90%', 'https://www.ksdl.kr/images/hero-orbit/02_tincash.png'],
  ['북앤라이프 도서문화상품권', '90%', 'https://www.ksdl.kr/images/hero-orbit/04_booknlife.png'],
  ['북앤라이프 교환권', '90%', 'https://www.ksdl.kr/images/hero-orbit/04_booknlife.png'],
  ['롯데 모바일상품권', '93%', 'https://www.ksdl.kr/images/hero-orbit/05_lotte.png'],
  ['구글 기프트카드', '85%', 'https://www.ksdl.kr/images/hero-orbit/03_googleplay.png'],
];

const steps = [
  ['01','https://www.ksdl.kr/images/icon1.png','상품권 선택','보유한 상품권과 현재 매입률을 확인합니다.'],
  ['02','https://www.ksdl.kr/images/icon2.png','신청정보 입력','PIN 번호, 계좌정보와 조회 비밀번호를 입력합니다.'],
  ['03','https://www.ksdl.kr/images/icon3.png','상품권 검수','접수된 PIN의 사용 가능 여부와 권면금액을 확인합니다.'],
  ['04','https://www.ksdl.kr/images/icon4.png','처리 완료','확인 결과에 따라 입금하고 처리상태를 안내합니다.'],
];

export default function Home(){
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'2-digit',month:'2-digit',day:'2-digit',weekday:'short'}).format(now);
  return <div className="sayo" id="top">
    <header className="topbar"><div className="shell headerIn">
      <a className="logo" href="#top"><span className="logoSymbol">S</span><span className="logoText">사요 상품권</span></a>
      <nav><a href="#lookup">내주문조회</a><a href="#rates">상품권매입시세</a><a href="#live">실시간매입현황</a><a href="#guide">이용방법</a><a href="#faq">자주묻는질문</a><a href="#customer">고객센터</a></nav>
      <a className="lookupBtn" href="#lookup">내주문조회</a>
    </div></header>

    <main>
      <section className="heroKsdl">
        <div className="shell heroShell">
          <div className="heroCopyKsdl"><h1>쉽고 빠르다! 상품권 서비스</h1><p>고객님의 상품권을 빠르고 간편하게 확인합니다.<br/>별도의 복잡한 절차 없이 신청할 수 있습니다.</p><a href="#apply">상품권 현금교환</a></div>
          <div className="orbitVisual" aria-label="사요 상품권 메인 배너 이미지 영역">
            <div className="phoneMock"><div className="phoneLogo">SAYO</div><div className="phoneLine"></div><b>사요 상품권</b><small>배너 이미지는 신규 이미지로 교체 예정</small></div>
            {rates.slice(0,5).map((r,i)=><span className={`orbitCard oc${i+1}`} key={r[0]}><img src={r[2]} alt={r[0]}/></span>)}
          </div>
        </div>
      </section>

      <section className="rateSection" id="rates"><div className="shell">
        <div className="todayTitle"><span>금일</span><b>{fmt}</b><strong>매입률</strong></div>
        <div className="rateGridKsdl">{rates.map(([name,rate,img])=><article key={name}><span className="rateLogo"><img src={img} alt={name}/></span><b>{name}</b><strong>{rate}</strong><button>교환하기</button></article>)}</div>
        <p className="dailyNote">✓ 매입률은 매일 업데이트 해드리고 있습니다</p>
      </div></section>

      <section id="apply" className="applySection"><div className="shell">
        <div className="sectionTitle"><p>상품권 현금교환</p><h2>상품권 정보를 입력하고 바로 신청하세요</h2><span>상품권 선택부터 PIN·계좌정보·조회 비밀번호까지 한 번에 접수할 수 있습니다.</span></div>
        <div className="applyCard">
          <h3>상품권 현금교환</h3><label>상품권</label><div className="productStrip">{rates.slice(0,6).map(([name,rate,img])=><button key={name}><img src={img} alt=""/><span>{name}</span><b>{rate}</b></button>)}</div>
          <label>핀번호</label><div className="pinRow"><input placeholder="상품권 핀번호 입력"/><input placeholder="상품권 금액 입력"/><button>+</button></div>
          <div className="quickAmounts"><span>빠른 금액</span>{['10,000','20,000','30,000','50,000','100,000'].map(v=><button key={v}>{v}</button>)}</div>
          <div className="sumGrid"><div><span>총금액</span><strong>0원</strong></div><div><span>교환수수료</span><strong>이체수수료 500원 포함</strong></div></div>
          <label>계좌정보</label><div className="accountGrid"><select defaultValue=""><option value="">은행 선택</option></select><input placeholder="계좌번호를 입력하세요."/><input placeholder="고객명(예금주)을 입력하세요."/></div>
          <label>비밀번호</label><div className="passwordGrid"><input type="password" placeholder="접수 비밀번호(최대 10자리)"/><input type="password" placeholder="접수 비밀번호 확인"/></div>
          <div className="noticeBox"><b>꼭! 알아두세요.</b><span>신청 건당 이체수수료 500원이 부과됩니다.</span><span>신청이 완료되면 취소 및 환불이 불가합니다.</span></div>
          <button className="submitBtn" type="button">상품권 현금교환 신청</button>
        </div>
      </div></section>

      <section id="live" className="liveSection"><div className="shell"><div className="liveCard"><div className="liveHead"><div><span className="liveIcon">▣</span><div><h2>실시간 진행 현황</h2><p>최근 매입 현황입니다</p></div></div><div className="liveDate"><i></i>{fmt}</div></div><div className="liveEmpty">실시간 데이터는 DB 연결 후 이 영역에 표시됩니다.</div><time>사요 상품권 실시간 매입현황</time></div></div></section>

      <section id="guide" className="guideSection"><div className="shell"><div className="sectionTitle"><p>이용 절차</p><h2>신청부터 입금까지 4단계</h2><span>처음 이용해도 순서대로 진행하면 어렵지 않습니다.</span></div><div className="stepGridKsdl">{steps.map(([n,img,t,d])=><article key={n}><span>{n}</span><div><img src={img} alt={t}/></div><h3>{t}</h3><p>{d}</p></article>)}</div><div className="centerBtn"><a href="#guide">자세한 이용방법 보기</a></div></div></section>

      <section id="faq" className="faqKsdl"><div className="shell"><div className="sectionTitle"><p>이용 전 확인</p><h2>자주 묻는 질문</h2><span>상품권 현금교환 신청 전 자주 문의하시는 내용을 확인해 주세요.</span></div><div className="faqListKsdl"><details><summary>회원가입이 필요한가요?</summary><p>별도 회원가입 없이 신청할 수 있습니다. 접수번호와 조회 비밀번호로 진행 상태를 확인할 수 있습니다.</p></details><details><summary>입금까지 얼마나 걸리나요?</summary><p>검수 및 운영 상황에 따라 순차적으로 입금 처리됩니다.</p></details><details><summary>매입하는 상품권은 어떤 것이 있나요?</summary><p>컬쳐랜드, 북앤라이프, 틴캐시, 롯데 모바일상품권, 구글 기프트카드 등을 취급할 예정입니다.</p></details><details><summary>최소 판매 금액이 있나요?</summary><p>최소 판매금액은 1만원 이상부터 적용하는 구조로 구축합니다.</p></details></div></div></section>
    </main>

    <footer id="customer"><div className="shell footerGrid"><div><a className="logo footerLogo" href="#top"><span className="logoSymbol">S</span><span className="logoText">사요 상품권</span></a><h3>안전한 접수와 정확한 처리를 약속드립니다.</h3><p>상품권 신청부터 진행 상태 확인까지 필요한 정보를 명확하게 안내해드립니다.</p></div><div className="business"><h4>사업자 정보</h4><p><span>상호</span><b>사요 상품권</b></p><p><span>대표</span><b>등록 예정</b></p><p><span>대표전화</span><b>등록 예정</b></p><p><span>도메인</span><b>seoyo.kr</b></p></div></div><div className="shell footerBottom"><span>개인정보처리방침 · 서비스 이용약관 · 자주 묻는 질문 · 신청내역 조회</span><small>© 2026 사요 상품권. All rights reserved.</small></div></footer>
  </div>
}
