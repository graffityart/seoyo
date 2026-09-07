'use client';
import {useEffect,useRef,useState} from 'react';

const items=[
  {key:'kakao',title:'카카오톡 문의',desc:'빠르고 친절한 상담!',tone:'yellow'},
  {key:'exchange',title:'상품권 교환신청',desc:'지금 바로 신청하세요!',tone:'blue'},
  {key:'buy',title:'상품권 구매',desc:'다양한 상품권을 만나보세요!',tone:'pink'}
];

function QuickIcon({item,small=false}){
  if(item.key==='kakao') return <span className={`floatingQuickImageIcon${small?' is-small':''}`}><img src="/images/brand/kakao.png" alt=""/></span>;
  if(item.key==='exchange') return <span className={`floatingQuickGlyph fq-glyph-blue${small?' is-small':''}`} aria-hidden="true"><i className="fq-doc">▤</i><b>✎</b></span>;
  return <span className={`floatingQuickGlyph fq-glyph-pink${small?' is-small':''}`} aria-hidden="true">🛒</span>;
}

export default function FloatingQuickMenu(){
  const [open,setOpen]=useState(false);
  const rootRef=useRef(null);
  useEffect(()=>{
    if(!open)return;
    const close=e=>{if(rootRef.current&&!rootRef.current.contains(e.target))setOpen(false)};
    const esc=e=>{if(e.key==='Escape')setOpen(false)};
    document.addEventListener('pointerdown',close);
    document.addEventListener('keydown',esc);
    return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',esc)};
  },[open]);

  return <div ref={rootRef} className={`floatingQuickMenu${open?' is-open':''}`}>
    {!open&&<div className="floatingQuickRail" aria-label="빠른 메뉴">
      {items.map(item=><button key={item.key} type="button" className={`floatingQuickIcon fq-${item.tone}`} onClick={()=>setOpen(true)} aria-label={item.title}>
        <QuickIcon item={item}/>
      </button>)}
    </div>}
    {open&&<div className="floatingQuickPanel" role="menu">
      {items.map(item=><button key={item.key} type="button" role="menuitem" className={`floatingQuickRow fq-${item.tone}`}>
        <QuickIcon item={item} small/>
        <span className="floatingQuickText"><strong>{item.title}</strong><small>{item.desc}</small></span>
        <span className="floatingQuickArrow">›</span>
      </button>)}
    </div>}
  </div>
}
