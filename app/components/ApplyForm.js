'use client';

import { useMemo, useState } from 'react';

export default function ApplyForm({ products, banks, settings }) {
  const minAmount = Number(settings?.minimumOrderAmount || 10000);
  const transferFee = Number(settings?.transferFee || 500);
  const [selected, setSelected] = useState(products[0]?.id || null);
  const [pin, setPin] = useState('');
  const [faceValue, setFaceValue] = useState('');
  const [items, setItems] = useState([]);
  const [bankId, setBankId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const product = products.find((p) => String(p.id) === String(selected));
  const total = useMemo(() => items.reduce((sum, x) => sum + x.faceValue, 0), [items]);
  const expected = useMemo(() => Math.max(0, items.reduce((sum, x) => sum + Math.floor(x.faceValue * x.rate / 100), 0) - (items.length ? transferFee : 0)), [items, transferFee]);

  function addItem(amountOverride) {
    const amount = Number(amountOverride ?? String(faceValue).replace(/,/g, ''));
    const cleanPin = pin.replace(/\s|-/g, '');
    if (!product) return alert('상품권을 선택해 주세요.');
    if (!cleanPin) return alert('상품권 핀번호를 입력해 주세요.');
    if (!Number.isFinite(amount) || amount <= 0) return alert('상품권 금액을 입력해 주세요.');
    if (product.slug === 'lotte-mobile' && !cleanPin.startsWith('23')) return alert("23으로 시작하는 '롯데 모바일 교환권'만 매입합니다");
    setItems((prev) => [...prev, { productId: product.id, name: product.name, pin: cleanPin, faceValue: amount, rate: Number(product.default_rate) }]);
    setPin(''); setFaceValue('');
  }

  async function submit() {
    if (total < minAmount) return alert(`최소 판매금액은 ${minAmount.toLocaleString()}원 이상 입니다`);
    if (!bankId || !accountNumber || !customerName || !phone) return alert('계좌정보와 연락처를 모두 입력해 주세요.');
    if (!password || password !== password2) return alert('조회 비밀번호를 확인해 주세요.');
    if (password.length > 10) return alert('조회 비밀번호는 최대 10자리입니다.');
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName, phone, bankId: Number(bankId), accountNumber, password, items }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '신청 처리 중 오류가 발생했습니다.');
      alert(`상품권 교환 신청이 접수되었습니다.\n접수번호: ${data.orderNo}`);
      setItems([]); setAccountNumber(''); setCustomerName(''); setPhone(''); setPassword(''); setPassword2('');
    } catch (e) { alert(e.message); } finally { setSubmitting(false); }
  }

  return <div className="applyCard">
    <h3>상품권 현금교환</h3>
    <label>상품권</label>
    <div className="productStrip">{products.map((p)=><button type="button" key={p.id} onClick={()=>setSelected(p.id)} aria-pressed={String(selected)===String(p.id)}><span>{p.name}</span><b>{Number(p.default_rate).toFixed(0)}%</b></button>)}</div>
    <label>핀번호</label>
    <div className="pinRow"><input value={pin} onChange={(e)=>setPin(e.target.value)} placeholder="상품권 핀번호 입력"/><input value={faceValue} onChange={(e)=>setFaceValue(e.target.value.replace(/[^0-9]/g,''))} placeholder="상품권 금액 입력"/><button type="button" onClick={()=>addItem()}>+</button></div>
    <div className="quickAmounts"><span>빠른 금액</span>{[10000,20000,30000,50000,100000].map(v=><button type="button" key={v} onClick={()=>addItem(v)}>{v.toLocaleString()}</button>)}</div>
    {items.length>0 && <div className="noticeBox"><b>추가된 상품권</b>{items.map((x,i)=><span key={i}>{x.name} · {x.faceValue.toLocaleString()}원 · PIN 끝자리 {x.pin.slice(-4)}</span>)}</div>}
    <div className="sumGrid"><div><span>총금액</span><strong>{total.toLocaleString()}원</strong></div><div><span>예상입금</span><strong>{expected.toLocaleString()}원</strong></div></div>
    <label>계좌정보</label>
    <div className="accountGrid"><select value={bankId} onChange={(e)=>setBankId(e.target.value)}><option value="">은행 선택</option>{banks.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select><input value={accountNumber} onChange={(e)=>setAccountNumber(e.target.value.replace(/[^0-9]/g,''))} placeholder="계좌번호를 입력하세요."/><input value={customerName} onChange={(e)=>setCustomerName(e.target.value)} placeholder="고객명(예금주)을 입력하세요."/></div>
    <label>연락처</label><div className="passwordGrid"><input value={phone} onChange={(e)=>setPhone(e.target.value.replace(/[^0-9]/g,''))} placeholder="휴대폰 번호를 입력하세요."/></div>
    <label>조회 비밀번호</label><div className="passwordGrid"><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="접수 비밀번호(최대 10자리)"/><input type="password" value={password2} onChange={(e)=>setPassword2(e.target.value)} placeholder="접수 비밀번호 확인"/></div>
    <div className="noticeBox"><b>꼭! 알아두세요.</b><span>신청 건당 이체수수료 {transferFee.toLocaleString()}원이 부과됩니다.</span><span>최소 판매금액은 {minAmount.toLocaleString()}원 이상입니다.</span></div>
    <button className="submitBtn" type="button" disabled={submitting} onClick={submit}>{submitting?'접수 중...':'상품권 현금교환 신청'}</button>
  </div>;
}
