'use client';

import { useMemo, useState } from 'react';

export default function ProductEditor({ products }){
  const [rows,setRows]=useState(products);
  const [saving,setSaving]=useState(null);
  const [message,setMessage]=useState('');
  const sorted=useMemo(()=>[...rows].sort((a,b)=>a.sort_order-b.sort_order||a.id-b.id),[rows]);

  function patch(id,key,value){
    setRows(prev=>prev.map(r=>r.id===id?{...r,[key]:value}:r));
  }

  async function save(row){
    setSaving(row.id); setMessage('');
    try{
      const res=await fetch(`/api/admin/products/${row.id}`,{
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({name:row.name,sort_order:Number(row.sort_order),is_active:Boolean(row.is_active)})
      });
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||'저장에 실패했습니다.');
      setMessage(`${row.name} 저장 완료`);
    }catch(e){ setMessage(e.message); }
    finally{ setSaving(null); }
  }

  return <section className="productAdminPanel">
    <div className="productAdminNotice">상품권명을 바꾸면 메인 화면과 신청폼에도 반영됩니다. <b>사용 중지</b> 시 고객 화면에서 즉시 숨겨집니다.</div>
    <div className="productAdminGrid">{sorted.map(row=><article className={`productAdminCard ${row.is_active?'':'disabled'}`} key={row.id}>
      <div className="productCardTop"><div><small>상품권 #{row.id}</small><strong>{row.name}</strong><span>{row.slug}</span></div><label className="productSwitch"><input type="checkbox" checked={row.is_active} onChange={e=>patch(row.id,'is_active',e.target.checked)}/><span></span><b>{row.is_active?'사용중':'사용중지'}</b></label></div>
      <div className="productFields"><label>상품권명<input value={row.name} maxLength={100} onChange={e=>patch(row.id,'name',e.target.value)}/></label><label>노출 순서<input type="number" min="0" max="9999" value={row.sort_order} onChange={e=>patch(row.id,'sort_order',e.target.value)}/></label><label>현재 매입률<input value={`${row.default_rate}%`} disabled/></label></div>
      <button className="productSaveBtn" disabled={saving===row.id} onClick={()=>save(row)}>{saving===row.id?'저장 중...':'상품권 정보 저장'}</button>
    </article>)}</div>
    {message&&<div className="adminToast">{message}</div>}
  </section>;
}
