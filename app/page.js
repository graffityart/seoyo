const rates = [
  ['컬쳐랜드 문화상품권', '90%'],
  ['온라인 문화상품권', '90%'],
  ['북앤라이프 도서문화상품권', '90%'],
  ['틴캐시 상품권', '90%'],
  ['롯데 모바일상품권', '93%'],
  ['구글 기프트카드', '85%'],
];

const steps = [
  ['01', '상품권 선택', '보유한 상품권 종류와 금액을 확인합니다.'],
  ['02', '교환 신청', 'PIN과 입금받을 계좌 정보를 입력합니다.'],
  ['03', '검수 진행', '접수된 상품권 정보를 순서대로 확인합니다.'],
  ['04', '처리 완료', '검수 결과와 처리 상태를 확인할 수 있습니다.'],
];

export default function Home() {
  const today = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', year: '2-digit', month: '2-digit', day: '2-digit', weekday: 'short'
  }).format(new Date());

  return (
    <main>
      <header className="siteHeader">
        <a className="brand" href="/" aria-label="사요 상품권 홈">
          <span className="brandMark">S</span><span><b>사요</b><small>상품권</small></span>
        </a>
        <nav>
          <a href="#rates">매입시세</a><a href="#status">실시간 현황</a><a href="#guide">이용방법</a><a href="#faq">자주묻는질문</a>
        </nav>
        <a className="headerAction" href="#apply">교환 신청</a>
      </header>

      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">SAYO GIFT CARD EXCHANGE</p>
          <h1>상품권 교환,<br/><em>확인하기 쉽게.</em></h1>
          <p className="lead">오늘의 매입률부터 신청 과정과 처리 현황까지 한 화면에서 확인하는 사요 상품권 서비스입니다.</p>
          <div className="heroActions"><a className="primary" href="#apply">상품권 교환 신청</a><a className="secondary" href="#rates">오늘의 매입률 보기</a></div>
          <div className="trustRow"><span>✓ 매일 매입률 안내</span><span>✓ 신청내역 조회</span><span>✓ 모바일 최적화</span></div>
        </div>
        <div className="heroPanel">
          <div className="panelTop"><span>오늘의 안내</span><b>{today}</b></div>
          <div className="heroRate"><span>롯데 모바일상품권</span><strong>93<small>%</small></strong></div>
          <div className="heroRate"><span>컬쳐랜드 문화상품권</span><strong>90<small>%</small></strong></div>
          <div className="panelFoot">매입률은 매일 업데이트해 안내합니다.</div>
        </div>
      </section>

      <section className="quickBar" id="apply">
        <div><span>상품권이 있으신가요?</span><strong>종류와 금액을 확인하고 교환 신청을 시작하세요.</strong></div>
        <button type="button">교환 신청 준비중</button>
      </section>

      <section className="section" id="rates">
        <div className="sectionHead"><div><p>DAILY RATE</p><h2>오늘의 상품권 매입률</h2></div><span>{today} 기준</span></div>
        <div className="rateGrid">{rates.map(([name, rate]) => <article className="rateCard" key={name}><div className="giftIcon">S</div><h3>{name}</h3><strong>{rate}</strong><p>현재 안내 매입률</p></article>)}</div>
        <p className="rateNote">※ 실제 적용 조건은 상품권 종류와 검수 결과에 따라 달라질 수 있으며, 최종 신청 화면에서 다시 확인할 수 있습니다.</p>
      </section>

      <section className="statusSection" id="status">
        <div className="statusIntro"><p>LIVE STATUS</p><h2>처리 과정을<br/>투명하게 확인하세요.</h2><p>접수 이후 어떤 단계인지 쉽게 파악할 수 있도록 실시간 매입 현황 영역을 준비하고 있습니다.</p><a href="#guide">이용방법 확인 →</a></div>
        <div className="statusMock">
          <div className="statusHead"><b>실시간 매입현황</b><span>LIVE</span></div>
          {[['컬쳐랜드 문화상품권','김*현','입금완료'],['롯데 모바일상품권','이*민','확인중'],['북앤라이프 상품권','박*준','접수중']].map((x,i)=><div className="statusRow" key={i}><span className="dot"></span><div><b>{x[0]}</b><small>{x[1]} 고객 · 방금 전</small></div><em>{x[2]}</em></div>)}
        </div>
      </section>

      <section className="section guide" id="guide">
        <div className="sectionHead"><div><p>HOW IT WORKS</p><h2>사요 상품권 이용방법</h2></div></div>
        <div className="stepGrid">{steps.map(([n,t,d])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>

      <section className="faqSection" id="faq">
        <div><p>FAQ</p><h2>처음 이용하시나요?</h2><p>신청 전에 많이 확인하는 내용을 간단하게 정리했습니다.</p></div>
        <div className="faqList"><details open><summary>어떤 상품권을 취급하나요?</summary><p>컬쳐랜드, 온라인 문화상품권, 북앤라이프, 틴캐시, 롯데 모바일상품권, 구글 기프트카드 등을 기준으로 서비스를 준비하고 있습니다.</p></details><details><summary>매입률은 언제 바뀌나요?</summary><p>상품권별 운영 기준에 따라 변경될 수 있으며 메인에 당일 안내 비율을 표시합니다.</p></details><details><summary>모바일에서도 신청할 수 있나요?</summary><p>네. 사요 상품권은 신청과 조회, 관리자 확인까지 모바일 사용성을 우선하여 구축합니다.</p></details></div>
      </section>

      <footer><div className="brand footerBrand"><span className="brandMark">S</span><span><b>사요</b><small>상품권</small></span></div><p>사요 상품권 · seoyo.kr</p><p className="footerNote">현재 서비스 구축 중이며 사업자 정보와 이용약관은 정식 오픈 전에 반영됩니다.</p></footer>
    </main>
  );
}
