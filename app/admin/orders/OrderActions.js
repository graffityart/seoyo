'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderActions({ id, initialStatus, initialPaid, expectedAmount }){
  const router = useRouter();
  const [status,setStatus]=useState(initialStatus);
  const [paid,setPaid]=useState(String(initialPaid || 0));
  const [saving,setSaving]=useState(false);

  function applyExpected(){
    setPaid(String(Number(expectedAmount||0)));
  }

  function handleStatus(value){
    setStatus(value);
    if(value==='rejected') setPaid('0');
  }

  async function save(){
    const paidAmount=Number(paid||0);
    if(status==='paid' && paidAmount<=0){
      return alert('입금완료 처리 시 실제 입금액을 입력해 주세요.');
    }
    setSaving(true);
    try{
      const res=await fetch(`/api/admin/orders/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status,paidAmount})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.message||'저장에 실패했습니다.');
      alert('처리정보가 저장되었습니다.');
      router.refresh();
    }catch(e){alert(e.message)}finally{setSaving(false)}
  }

  async function remove(){
    if(!confirm('이 신청건을 삭제하시겠습니까? 삭제하면 실시간 매입현황에서도 제외됩니다.')) return;
    const res=await fetch(`/api/admin/orders/${id}`,{method:'DELETE'});
    const data=await res.json();
    if(!res.ok) return alert(data.message||'삭제에 실패했습니다.');
    router.replace('/admin/orders');
    router.refresh();
  }

  return <div className="actionBox">
    <h3>처리정보 저장</h3>
    <div className="actionGrid">
      <label>처리상태<select value={status} onChange={(e)=>handleStatus(e.target.value)}><option value="received">접수중</option><option value="reviewing">확인중</option><option value="paid">입금완료</option><option value="rejected">처리불가</option></select></label>
      <label>실제 입금액<div style={{display:'flex',gap:8}}><input style={{flex:1}} value={paid} onChange={(e)=>setPaid(e.target.value.replace(/[^0-9]/g,''))}/><button type="button" onClick={applyExpected} style={{whiteSpace:'nowrap'}}>입금 금액 적용</button></div></label>
    </div>
    <div className="actionBtns"><button onClick={save} disabled={saving}>{saving?'저장 중...':'처리정보 저장'}</button><button className="danger" onClick={remove}>신청건 삭제</button></div>
  </div>
}
