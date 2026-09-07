'use client';

import Link from 'next/link';

const statusLabel={received:'접수중',reviewing:'확인중',checking:'확인중',completed:'입금완료',paid:'입금완료',impossible:'처리불가',rejected:'처리불가'};

export default function HomeStatusBoard({orders=[],notices=[]}){
  const rows=orders.map((o)=>({key:o.order_no,name:o.product_names||'상품권',count:Number(o.item_count||1),customer:o.customer_name||'',imageUrl:o.imageUrl||'',status:statusLabel[o.status]||'처리중',statusClass:`status-${o.status||'received'}`}));
  const loopRows=rows.length>4?[...rows,...rows]:rows;
  return <section id="live" className="statusBoardSection"><div className="shell statusBoardGrid">
    <article className="statusBoardCard liveBoardCard">
      <div className="statusBoardHead"><div className="statusBoardTitle"><span className="statusBoardIcon">◷</span><div><h2>실시간 매입 진행현황</h2><p>최근 매입현황입니다.</p></div></div><Link className="statusArrow" href="/live" aria-label="실시간 매입 현황 전체보기">→</Link></div>
      {rows.length?<div className="liveTicker"><div className={rows.length>4?'liveTickerTrack is-moving':'liveTickerTrack'}>{loopRows.map((row,index)=><div className="liveTickerRow" key={`${row.key}-${index}`}><span className="tickerLogo">{row.imageUrl?<img src={row.imageUrl} alt=""/>:'🎫'}</span><div className="tickerMain"><strong>{row.name} {row.count}건</strong><span>{maskName(row.customer)}</span></div><span className={`tickerStatus ${row.statusClass}`}>{row.status}</span></div>)}</div></div>:<div className="statusEmpty">아직 접수된 매입 내역이 없습니다.</div>}
    </article>
    <article className="statusBoardCard noticeBoardCard">
      <div className="statusBoardHead"><div className="statusBoardTitle"><span className="statusBoardIcon">♧</span><div><h2>공지사항</h2><p>새로운 소식을 전해드립니다.</p></div></div><Link className="statusArrow" href="/notice" aria-label="공지사항 전체보기">→</Link></div>
      <div className="homeNoticeList">{notices.length?notices.slice(0,6).map(post=><Link href={`/notice#notice-${post.id}`} key={post.id}><strong>{post.title}</strong><time>{post.date}</time></Link>):<div className="statusEmpty">등록된 공지사항이 없습니다.</div>}</div>
    </article>
  </div></section>
}

function maskName(name=''){const c=Array.from(name);if(c.length<=1)return'*';if(c.length===2)return`${c[0]}*`;return`${c[0]}*${c[c.length-1]}`}
