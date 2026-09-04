'use client';

import { useState } from 'react';
import styles from './OrderLookup.module.css';

export default function OrderLookup() {
  const [orderNo, setOrderNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function lookup(event) {
    event.preventDefault();
    setError('');
    setResult(null);
    if (!orderNo.trim() || !password) {
      setError('접수번호와 조회 비밀번호를 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '주문을 조회할 수 없습니다.');
      setResult(data.order);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return <div className={styles.lookupCard}>
    <form className={styles.lookupForm} onSubmit={lookup}>
      <div>
        <label htmlFor="lookupOrderNo">접수번호</label>
        <input id="lookupOrderNo" value={orderNo} onChange={(e)=>setOrderNo(e.target.value.toUpperCase())} placeholder="신청 완료 시 받은 접수번호" autoComplete="off" />
      </div>
      <div>
        <label htmlFor="lookupPassword">조회 비밀번호</label>
        <input id="lookupPassword" type="password" maxLength={10} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="신청 시 설정한 비밀번호" autoComplete="current-password" />
      </div>
      <button type="submit" disabled={loading}>{loading ? '조회 중...' : '내 주문 조회'}</button>
    </form>

    {error && <div className={styles.error}>{error}</div>}

    {result && <div className={styles.result}>
      <div className={styles.resultHead}>
        <div><span>접수번호</span><strong>{result.orderNo}</strong></div>
        <b>{result.statusLabel}</b>
      </div>
      <div className={styles.amountGrid}>
        <div><span>신청금액</span><strong>{result.requestedAmount.toLocaleString()}원</strong></div>
        <div><span>예상입금</span><strong>{result.expectedAmount.toLocaleString()}원</strong></div>
        <div><span>실제입금</span><strong>{result.paidAmount.toLocaleString()}원</strong></div>
      </div>
      <div className={styles.items}>
        {result.items.map((item, index)=><div className={styles.item} key={`${item.productName}-${index}`}>
          <div><b>{item.productName}</b><span>{item.faceValue.toLocaleString()}원 · 매입률 {item.ratePercent.toFixed(0)}%</span></div>
          <strong>{item.expectedAmount.toLocaleString()}원</strong>
        </div>)}
      </div>
      <p className={styles.notice}>조회 화면에는 개인정보와 상품권 PIN 번호를 표시하지 않습니다.</p>
    </div>}
  </div>;
}
