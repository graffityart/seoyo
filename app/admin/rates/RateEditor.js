'use client';

import { useState } from 'react';

export default function RateEditor({ products }) {
  const [rows, setRows] = useState(products);
  const [saving, setSaving] = useState(null);
  const [message, setMessage] = useState('');

  const change = (id, value) => setRows(r => r.map(x => x.id === id ? { ...x, default_rate: value } : x));

  async function save(row) {
    setSaving(row.id); setMessage('');
    try {
      const res = await fetch('/api/admin/rates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: row.id, rate: Number(row.default_rate) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '저장에 실패했습니다.');
      setMessage(`${row.name} 매입률을 ${data.rate}%로 저장했습니다.`);
    } catch (e) { setMessage(e.message); }
    finally { setSaving(null); }
  }

  return <section className="adminPanel rateAdminPanel">
    {message && <div className="adminNotice">{message}</div>}
    <div className="rateAdminGrid">
      {rows.map(row => <article className="rateAdminCard" key={row.id}>
        <div><small>상품권</small><h3>{row.name}</h3><p>{row.slug}</p></div>
        <div className="rateInputWrap"><input type="number" min="0" max="100" step="0.1" value={row.default_rate} onChange={e=>change(row.id,e.target.value)}/><span>%</span></div>
        <button disabled={saving===row.id} onClick={()=>save(row)}>{saving===row.id?'저장중...':'매입률 저장'}</button>
      </article>)}
    </div>
  </section>;
}
