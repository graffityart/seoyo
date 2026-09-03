'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm(){
  const router = useRouter();
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    setLoading(true); setError('');
    try{
      const res = await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || '로그인에 실패했습니다.');
      router.replace('/admin/orders');
      router.refresh();
    }catch(err){setError(err.message)}finally{setLoading(false)}
  }

  return <form className="loginCard" onSubmit={submit}>
    <h1>ADMINISTRATOR</h1>
    <p>사요 상품권 관리자 로그인</p>
    <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="관리자 비밀번호" autoFocus />
    <button disabled={loading}>{loading?'로그인 중...':'관리자 로그인'}</button>
    {error && <div className="loginError">{error}</div>}
  </form>
}
