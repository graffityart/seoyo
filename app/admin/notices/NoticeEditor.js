'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NoticeEditor({notices}){
  const router=useRouter();
  const empty={title:'',content:'',is_published:true,is_pinned:false};
  const [form,setForm]=useState(empty);
  const [saving,setSaving]=useState(false);

  async function createNotice(){
    setSaving(true);
    try{
      const res=await fetch('/api/admin/notices',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||'공지 등록에 실패했습니다.');
      setForm(empty);
      router.refresh();
    }catch(e){alert(e.message);}finally{setSaving(false);}
  }

  async function updateNotice(id,values){
    const res=await fetch(`/api/admin/notices/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(values)});
    const data=await res.json();
    if(!res.ok) return alert(data.error||'저장에 실패했습니다.');
    alert('공지사항이 저장되었습니다.');
    router.refresh();
  }

  async function removeNotice(id){
    if(!confirm('이 공지사항을 삭제하시겠습니까?')) return;
    const res=await fetch(`/api/admin/notices/${id}`,{method:'DELETE'});
    const data=await res.json();
    if(!res.ok) return alert(data.error||'삭제에 실패했습니다.');
    router.refresh();
  }

  return <div className="noticeAdminWrap">
    <section className="noticeAdminCard">
      <div className="noticeAdminHead"><div><small>NEW NOTICE</small><h2>새 공지사항 등록</h2></div></div>
      <label>제목<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="공지사항 제목을 입력하세요."/></label>
      <label>내용<textarea rows="8" value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="공지 내용을 입력하세요."/></label>
      <div className="noticeAdminChecks"><label><input type="checkbox" checked={form.is_published} onChange={e=>setForm({...form,is_published:e.target.checked})}/> 메인/공지사항에 공개</label><label><input type="checkbox" checked={form.is_pinned} onChange={e=>setForm({...form,is_pinned:e.target.checked})}/> 상단 고정</label></div>
      <button className="noticeAdminPrimary" type="button" disabled={saving} onClick={createNotice}>{saving?'등록 중...':'공지사항 등록'}</button>
    </section>

    <section className="noticeAdminList">
      {notices.length===0&&<div className="noticeAdminEmpty">등록된 공지사항이 없습니다.</div>}
      {notices.map(n=><NoticeRow key={n.id} notice={n} onSave={updateNotice} onDelete={removeNotice}/>) }
    </section>
  </div>;
}

function NoticeRow({notice,onSave,onDelete}){
  const [v,setV]=useState(notice);
  return <article className="noticeAdminCard noticeAdminRow">
    <div className="noticeAdminRowTop"><div><b>#{notice.id}</b><span>{v.is_published?'공개':'비공개'}</span>{v.is_pinned&&<em>상단고정</em>}</div><button type="button" onClick={()=>onDelete(notice.id)}>삭제</button></div>
    <label>제목<input value={v.title} onChange={e=>setV({...v,title:e.target.value})}/></label>
    <label>내용<textarea rows="6" value={v.content} onChange={e=>setV({...v,content:e.target.value})}/></label>
    <div className="noticeAdminMeta">등록일 {v.created_at_label}</div>
    <div className="noticeAdminChecks"><label><input type="checkbox" checked={Boolean(v.is_published)} onChange={e=>setV({...v,is_published:e.target.checked})}/> 공개</label><label><input type="checkbox" checked={Boolean(v.is_pinned)} onChange={e=>setV({...v,is_pinned:e.target.checked})}/> 상단 고정</label></div>
    <button className="noticeAdminPrimary" type="button" onClick={()=>onSave(notice.id,v)}>변경사항 저장</button>
  </article>;
}
