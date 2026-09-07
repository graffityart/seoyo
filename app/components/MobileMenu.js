'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cashMenuItems } from './ProductCashMenu';

export default function MobileMenu(){
  const [open,setOpen]=useState(false);
  const [cashOpen,setCashOpen]=useState(false);

  useEffect(()=>{
    if(!open)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const onKey=e=>{if(e.key==='Escape')setOpen(false)};
    window.addEventListener('keydown',onKey);
    return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey)};
  },[open]);

  const close=()=>{setOpen(false);setCashOpen(false)};

  return <div className="mobileNavRoot">
    <button type="button" className="mobileMenuBtn" onClick={()=>setOpen(true)} aria-label="메뉴 열기" aria-expanded={open}>
      <span></span><span></span><span></span>
    </button>
    <div className={`mobileMenuOverlay ${open?'isOpen':''}`} onClick={close} aria-hidden={!open}/>
    <aside className={`mobileMenuDrawer ${open?'isOpen':''}`} aria-hidden={!open}>
      <div className="mobileMenuTop">
        <strong>전체 메뉴</strong>
        <button type="button" onClick={close} aria-label="메뉴 닫기">×</button>
      </div>
      <nav className="mobileMenuLinks">
        <Link href="/#rates" onClick={close}>상품권매입시세 <span>›</span></Link>
        <Link href="/live" onClick={close}>실시간매입현황 <span>›</span></Link>
        <Link href="/#guide" onClick={close}>이용방법 <span>›</span></Link>
        <button type="button" className="mobileCashToggle" onClick={()=>setCashOpen(v=>!v)} aria-expanded={cashOpen}>
          <span>각상품권별 매입신청</span><b>{cashOpen?'−':'+'}</b>
        </button>
        {cashOpen&&<div className="mobileCashLinks">{cashMenuItems.map(item=><Link key={item.slug} href={`/cash/${item.slug}`} onClick={close}>{item.label}</Link>)}</div>}
        <Link href="/#faq" onClick={close}>자주묻는질문 <span>›</span></Link>
        <Link href="/#customer" onClick={close}>고객센터 <span>›</span></Link>
      </nav>
      <div className="mobileMenuBottom"><Link href="/#apply" onClick={close}>상품권 현금교환 신청</Link></div>
    </aside>
  </div>
}
