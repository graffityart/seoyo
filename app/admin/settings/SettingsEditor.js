'use client';

import { useState } from 'react';

export default function SettingsEditor({ initial }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '저장 중 오류가 발생했습니다.');
      alert('서비스 운영 설정이 저장되었습니다.');
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return <section className="adminPanel settingsPanel">
    <div className="settingsGrid">
      <label><span>최소 교환금액</span><small>여러 장의 상품권을 합산한 최종 신청금액 기준입니다.</small><div className="settingInput"><input type="number" min="1000" step="1000" value={form.minimumOrderAmount} onChange={e=>update('minimumOrderAmount', Number(e.target.value))}/><b>원</b></div></label>
      <label><span>이체수수료</span><small>상품권 장수가 아니라 접수 1건당 한 번만 적용됩니다.</small><div className="settingInput"><input type="number" min="0" step="100" value={form.transferFee} onChange={e=>update('transferFee', Number(e.target.value))}/><b>원</b></div></label>
      <label className="wide"><span>메인 매입률 안내문구</span><small>오늘의 매입률 카드 아래 안내 문구입니다.</small><input type="text" maxLength="120" value={form.rateNotice} onChange={e=>update('rateNotice', e.target.value)}/></label>
      <label><span>실시간 매입현황 노출 건수</span><small>메인에 최근 주문을 몇 건까지 표시할지 설정합니다.</small><div className="settingInput"><input type="number" min="1" max="30" value={form.liveOrderLimit} onChange={e=>update('liveOrderLimit', Number(e.target.value))}/><b>건</b></div></label>
    </div>
    <button className="settingsSave" type="button" disabled={saving} onClick={save}>{saving?'저장 중...':'운영 설정 저장'}</button>
  </section>;
}
