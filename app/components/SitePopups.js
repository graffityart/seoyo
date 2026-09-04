'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './SitePopups.module.css';

function todayKey(id){
  const d=new Date();
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,'0');
  const day=String(d.getDate()).padStart(2,'0');
  return `sayo-popup-${id}-${y}${m}${day}`;
}

export default function SitePopups({ popups=[] }){
  const [hiddenIds,setHiddenIds]=useState([]);
  const [closedIds,setClosedIds]=useState([]);

  useEffect(()=>{
    const hidden=[];
    for(const popup of popups){
      try{ if(localStorage.getItem(todayKey(popup.id))==='1') hidden.push(popup.id); }catch{}
    }
    setHiddenIds(hidden);
  },[popups]);

  const visible=useMemo(()=>popups.filter(p=>!hiddenIds.includes(p.id)&&!closedIds.includes(p.id)),[popups,hiddenIds,closedIds]);
  const popup=visible[0];
  if(!popup) return null;

  function close(){ setClosedIds(prev=>[...prev,popup.id]); }
  function hideToday(){
    try{ localStorage.setItem(todayKey(popup.id),'1'); }catch{}
    setHiddenIds(prev=>[...prev,popup.id]);
  }

  const imageNode = popup.imageUrl ? (
    <picture>
      {popup.mobileImageUrl && <source media="(max-width: 640px)" srcSet={popup.mobileImageUrl}/>} 
      <img src={popup.imageUrl} alt={popup.title||'팝업 이미지'}/>
    </picture>
  ) : popup.mobileImageUrl ? <img src={popup.mobileImageUrl} alt={popup.title||'팝업 이미지'}/> : null;

  return <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={popup.title||'공지 팝업'}>
    <div className={styles.popup}>
      <button className={styles.closeX} type="button" onClick={close} aria-label="닫기">×</button>
      {imageNode && <div className={styles.imageWrap}>{popup.linkUrl ? <a href={popup.linkUrl}>{imageNode}</a> : imageNode}</div>}
      <div className={styles.body}>
        {popup.title && <h2>{popup.title}</h2>}
        {popup.content && <p>{popup.content}</p>}
        {popup.linkUrl && <a className={styles.linkBtn} href={popup.linkUrl}>자세히 보기</a>}
      </div>
      <div className={styles.footer}>
        <button type="button" onClick={hideToday}>오늘 하루 보지 않기</button>
        <button type="button" onClick={close}>닫기</button>
      </div>
    </div>
  </div>;
}
