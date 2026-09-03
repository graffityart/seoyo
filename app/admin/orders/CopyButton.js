'use client';

import { useState } from 'react';

export default function CopyButton({ value }){
  const [done,setDone]=useState(false);
  async function copy(){
    await navigator.clipboard.writeText(String(value || ''));
    setDone(true); setTimeout(()=>setDone(false),1200);
  }
  return <button type="button" className="copyBtn" onClick={copy}>{done?'복사됨':'복사'}</button>;
}
