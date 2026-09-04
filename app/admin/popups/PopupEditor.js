'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PopupEditor.module.css';

function toLocalInput(value){
  if(!value) return '';
  const d=new Date(value);
  if(Number.isNaN(d.getTime())) return '';
  const p=n=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function PopupEditor({ popups }){
  const router=useRouter();
  const empty={title:'',content:'',image_url:'',link_url:'',is_active:false,start_at:'',end_at:'',sort_order:0};
  const [form,setForm]=useState(empty);
  const [saving,setSaving]=useState(false);

  async function createPopup(){
    setSaving(true);
    try{
      const res=await fetch('/api/admin/popups',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||'팝업 등록에 실패했습니다.');
      setForm(empty);
      router.refresh();
    }catch(e){ alert(e.message); }finally{ setSaving(false); }
  }

  async function updatePopup(id, values){
    const res=await fetch(`/api/admin/popups/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(values)});
    const data=await res.json();
    if(!res.ok) return alert(data.error||'저장에 실패했습니다.');
    alert('팝업이 저장되었습니다.');
    router.refresh();
  }

  async function removePopup(id){
    if(!confirm('이 팝업을 삭제하시겠습니까?')) return;
    const res=await fetch(`/api/admin/popups/${id}`,{method:'DELETE'});
    const data=await res.json();
    if(!res.ok) return alert(data.error||'삭제에 실패했습니다.');
    router.refresh();
  }

  return <div className={styles.wrap}>
    <section className={styles.createCard}>
      <h2>새 팝업 등록</h2>
      <div className={styles.grid}>
        <label>제목<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="공지 제목"/></label>
        <label>노출 순서<input type="number" min="0" value={form.sort_order} onChange={e=>setForm({...form,sort_order:Number(e.target.value)})}/></label>
        <label className={styles.full}>내용<textarea rows="5" value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="팝업 내용을 입력하세요."/></label>
        <label className={styles.full}>이미지 URL<input value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} placeholder="https://..."/></label>
        <label className={styles.full}>클릭 링크<input value={form.link_url} onChange={e=>setForm({...form,link_url:e.target.value})} placeholder="https://... 또는 /경로"/></label>
        <label>노출 시작<input type="datetime-local" value={form.start_at} onChange={e=>setForm({...form,start_at:e.target.value})}/></label>
        <label>노출 종료<input type="datetime-local" value={form.end_at} onChange={e=>setForm({...form,end_at:e.target.value})}/></label>
        <label className={styles.check}><input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})}/> 사용중</label>
      </div>
      <button className={styles.primary} type="button" disabled={saving} onClick={createPopup}>{saving?'등록 중...':'팝업 등록'}</button>
    </section>

    <section className={styles.list}>
      {popups.length===0 && <div className={styles.empty}>등록된 팝업이 없습니다.</div>}
      {popups.map(p=><PopupRow key={p.id} popup={p} onSave={updatePopup} onDelete={removePopup}/>) }
    </section>
  </div>;
}

function PopupRow({popup,onSave,onDelete}){
  const [v,setV]=useState({...popup,start_at:toLocalInput(popup.start_at),end_at:toLocalInput(popup.end_at)});
  return <article className={styles.card}>
    <div className={styles.cardHead}><div><b>#{popup.id}</b><span>{v.is_active?'사용중':'중지'}</span></div><button type="button" onClick={()=>onDelete(popup.id)}>삭제</button></div>
    <div className={styles.grid}>
      <label>제목<input value={v.title} onChange={e=>setV({...v,title:e.target.value})}/></label>
      <label>노출 순서<input type="number" min="0" value={v.sort_order} onChange={e=>setV({...v,sort_order:Number(e.target.value)})}/></label>
      <label className={styles.full}>내용<textarea rows="4" value={v.content} onChange={e=>setV({...v,content:e.target.value})}/></label>
      <label className={styles.full}>이미지 URL<input value={v.image_url||''} onChange={e=>setV({...v,image_url:e.target.value})}/></label>
      <label className={styles.full}>클릭 링크<input value={v.link_url||''} onChange={e=>setV({...v,link_url:e.target.value})}/></label>
      <label>노출 시작<input type="datetime-local" value={v.start_at||''} onChange={e=>setV({...v,start_at:e.target.value})}/></label>
      <label>노출 종료<input type="datetime-local" value={v.end_at||''} onChange={e=>setV({...v,end_at:e.target.value})}/></label>
      <label className={styles.check}><input type="checkbox" checked={Boolean(v.is_active)} onChange={e=>setV({...v,is_active:e.target.checked})}/> 사용중</label>
    </div>
    <button className={styles.primary} type="button" onClick={()=>onSave(popup.id,v)}>변경사항 저장</button>
  </article>;
}
