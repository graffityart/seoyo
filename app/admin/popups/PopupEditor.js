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

async function uploadPopupImage(file,kind){
  const fd=new FormData();
  fd.append('file',file);
  fd.append('kind',kind);
  const res=await fetch('/api/admin/popups/upload',{method:'POST',body:fd});
  const data=await res.json();
  if(!res.ok) throw new Error(data.error||'이미지 업로드에 실패했습니다.');
  return data.url;
}

export default function PopupEditor({ popups }){
  const router=useRouter();
  const empty={title:'',content:'',image_url:'',mobile_image_url:'',link_url:'',is_active:false,start_at:'',end_at:'',sort_order:0};
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
        <ImageUploader label="PC 이미지" kind="pc" value={form.image_url} onChange={url=>setForm({...form,image_url:url})}/>
        <ImageUploader label="모바일 이미지" kind="mobile" value={form.mobile_image_url} onChange={url=>setForm({...form,mobile_image_url:url})}/>
        <label className={styles.full}>클릭 링크<input value={form.link_url} onChange={e=>setForm({...form,link_url:e.target.value})} placeholder="https://... 또는 /경로"/></label>
        <label>노출 시작<input type="datetime-local" value={form.start_at} onChange={e=>setForm({...form,start_at:e.target.value})}/></label>
        <label>노출 종료<input type="datetime-local" value={form.end_at} onChange={e=>setForm({...form,end_at:e.target.value})}/></label>
        <label className={styles.check}><input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})}/> 사용중</label>
      </div>
      <p className={styles.help}>PC 권장 600×750px 전후 · 모바일 권장 750×1000px 전후 · JPG/PNG/WebP · 최대 4MB</p>
      <button className={styles.primary} type="button" disabled={saving} onClick={createPopup}>{saving?'등록 중...':'팝업 등록'}</button>
    </section>

    <section className={styles.list}>
      {popups.length===0 && <div className={styles.empty}>등록된 팝업이 없습니다.</div>}
      {popups.map(p=><PopupRow key={p.id} popup={p} onSave={updatePopup} onDelete={removePopup}/>) }
    </section>
  </div>;
}

function ImageUploader({label,kind,value,onChange}){
  const [uploading,setUploading]=useState(false);
  async function choose(e){
    const file=e.target.files?.[0];
    if(!file) return;
    setUploading(true);
    try{ onChange(await uploadPopupImage(file,kind)); }
    catch(err){ alert(err.message); }
    finally{ setUploading(false); e.target.value=''; }
  }
  return <div className={styles.imageField}>
    <span>{label}</span>
    <div className={styles.uploadRow}><label className={styles.uploadBtn}>{uploading?'업로드 중...':'이미지 선택'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={choose}/></label>{value&&<button type="button" className={styles.clearBtn} onClick={()=>onChange('')}>이미지 제거</button>}</div>
    {value&&<div className={styles.preview}><img src={value} alt={`${label} 미리보기`}/></div>}
    <input className={styles.urlInput} value={value||''} onChange={e=>onChange(e.target.value)} placeholder="직접 URL 입력도 가능합니다."/>
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
      <ImageUploader label="PC 이미지" kind="pc" value={v.image_url||''} onChange={url=>setV({...v,image_url:url})}/>
      <ImageUploader label="모바일 이미지" kind="mobile" value={v.mobile_image_url||''} onChange={url=>setV({...v,mobile_image_url:url})}/>
      <label className={styles.full}>클릭 링크<input value={v.link_url||''} onChange={e=>setV({...v,link_url:e.target.value})}/></label>
      <label>노출 시작<input type="datetime-local" value={v.start_at||''} onChange={e=>setV({...v,start_at:e.target.value})}/></label>
      <label>노출 종료<input type="datetime-local" value={v.end_at||''} onChange={e=>setV({...v,end_at:e.target.value})}/></label>
      <label className={styles.check}><input type="checkbox" checked={Boolean(v.is_active)} onChange={e=>setV({...v,is_active:e.target.checked})}/> 사용중</label>
    </div>
    <button className={styles.primary} type="button" onClick={()=>onSave(popup.id,v)}>변경사항 저장</button>
  </article>;
}
