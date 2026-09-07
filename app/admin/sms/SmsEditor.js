'use client';
import {useState} from 'react';

const toggleKeys=['sms_received_customer_enabled','sms_received_admin_enabled','sms_reviewing_enabled','sms_paid_enabled','sms_rejected_enabled'];
const templates=[
  ['sms_template_received_customer','고객 접수 완료'],
  ['sms_template_received_admin','관리자 신규 접수'],
  ['sms_template_reviewing','확인중'],
  ['sms_template_paid','입금완료'],
  ['sms_template_rejected','처리불가']
];
export default function SmsEditor({initial,configState}){
  const[form,setForm]=useState(initial),[saving,setSaving]=useState(false),[testPhone,setTestPhone]=useState(''),[testMessage,setTestMessage]=useState('[사요상품권] 문자 발송 테스트입니다.'),[testing,setTesting]=useState(false);
  const set=(k,v)=>setForm(x=>({...x,[k]:v}));
  async function save(){setSaving(true);try{const r=await fetch('/api/admin/sms/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});const d=await r.json();if(!r.ok)throw new Error(d.message||'저장 실패');alert('문자 설정을 저장했습니다.')}catch(e){alert(e.message)}finally{setSaving(false)}}
  async function test(){if(!testPhone)return alert('테스트 수신번호를 입력해 주세요.');setTesting(true);try{const r=await fetch('/api/admin/sms/test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:testPhone,message:testMessage})});const d=await r.json();if(!r.ok)throw new Error(d.message||'발송 실패');alert(`테스트 문자를 요청했습니다. 결과코드: ${d.code||'-'}`)}catch(e){alert(e.message)}finally{setTesting(false)}}
  return <div className="smsAdminGrid">
    <section className="smsAdminCard"><div className="smsAdminHead"><div><h2>아이코드 연결 상태</h2><p>토큰키와 발신번호는 보안을 위해 Vercel 환경변수로 관리합니다.</p></div><span className={configState.tokenConfigured&&configState.callbackConfigured?'ok':'wait'}>{configState.tokenConfigured&&configState.callbackConfigured?'연결정보 설정됨':'설정 필요'}</span></div><div className="smsStatusRows"><p><span>ICODE_TOKEN_KEY</span><b>{configState.tokenConfigured?'등록됨':'미등록'}</b></p><p><span>ICODE_CALLBACK_PHONE</span><b>{configState.callbackConfigured?'등록됨':'미등록'}</b></p><p><span>서버</span><b>{configState.host}:{configState.port}</b></p></div></section>
    <section className="smsAdminCard"><h2>기본 발송 설정</h2><label className="smsField">관리자 수신번호<input value={form.sms_admin_phone||''} onChange={e=>set('sms_admin_phone',e.target.value)} placeholder="010-0000-0000"/></label><label className="smsField">문자 머리말<input value={form.sms_prefix||''} onChange={e=>set('sms_prefix',e.target.value)} placeholder="[사요상품권]"/></label><div className="smsToggles">{toggleKeys.map(k=><label key={k}><input type="checkbox" checked={form[k]==='1'} onChange={e=>set(k,e.target.checked?'1':'0')}/><span>{({sms_received_customer_enabled:'고객 접수 문자',sms_received_admin_enabled:'관리자 신규 접수 문자',sms_reviewing_enabled:'확인중 문자',sms_paid_enabled:'입금완료 문자',sms_rejected_enabled:'처리불가 문자'})[k]}</span></label>)}</div></section>
    <section className="smsAdminCard smsWide"><h2>상태별 문자 문구</h2><p className="smsVars">사용 가능 변수: {'{접수번호}'} {'{신청자}'} {'{전화번호}'} {'{신청금액}'} {'{입금금액}'}</p>{templates.map(([k,label])=><label className="smsTemplate" key={k}><span>{label}</span><textarea rows="3" maxLength="2000" value={form[k]||''} onChange={e=>set(k,e.target.value)}/><small>{new Blob([form[k]||'']).size} byte</small></label>)}<button className="smsPrimary" onClick={save} disabled={saving}>{saving?'저장 중...':'SMS 설정 저장'}</button></section>
    <section className="smsAdminCard smsWide"><h2>문자 테스트</h2><p>실제 아이코드로 1건 발송합니다. 발신번호가 아이코드에 사전등록되어 있어야 합니다.</p><div className="smsTestGrid"><input value={testPhone} onChange={e=>setTestPhone(e.target.value.replace(/[^0-9-]/g,''))} placeholder="수신번호"/><textarea rows="3" value={testMessage} onChange={e=>setTestMessage(e.target.value)}/><button onClick={test} disabled={testing}>{testing?'발송 중...':'테스트 발송'}</button></div></section>
  </div>
}
