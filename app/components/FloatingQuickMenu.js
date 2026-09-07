'use client';
import {useState} from 'react';

const items=[
  {key:'kakao',title:'카톡문의',desc:'빠르고 친절한 상담',icon:'💬',tone:'yellow'},
  {key:'exchange',title:'교환신청',desc:'상품권 현금교환 신청',icon:'✎',tone:'blue'},
  {key:'buy',title:'상품권구매',desc:'상품권 구매 안내',icon:'🛒',tone:'pink'}
];

export default function FloatingQuickMenu(){
  const [open,setOpen]=useState(false);
  return <div className={`floatingQuickMenu${open?' is-open':''}`}>
    <button type="button" className="floatingQuickToggle" aria-label={open?'빠른 메뉴 닫기':'빠른 메뉴 열기'} onClick={()=>setOpen(v=>!v)}>
      <span>{open?'×':'⋯'}</span>
    </button>
    <div className="floatingQuickRail">
      {items.map(item=><button key={item.key} type="button" className={`floatingQuickIcon fq-${item.tone}`} onClick={()=>setOpen(true)} aria-label={item.title}>
        <span>{item.icon}</span>
      </button>)}
    </div>
    <div className="floatingQuickPanel" aria-hidden={!open}>
      {items.map(item=><button key={item.key} type="button" className={`floatingQuickRow fq-${item.tone}`}>
        <span className="floatingQuickRowIcon">{item.icon}</span>
        <span className="floatingQuickText"><strong>{item.title}</strong><small>{item.desc}</small></span>
        <span className="floatingQuickArrow">›</span>
      </button>)}
    </div>
  </div>
}
