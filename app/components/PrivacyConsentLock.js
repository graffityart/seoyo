'use client';

import {useEffect} from 'react';

export default function PrivacyConsentLock(){
  useEffect(()=>{
    let timer;
    const enforce=()=>{
      const input=document.querySelector('.privacyConsent input[type="checkbox"]');
      if(!input)return;
      if(!input.checked){
        input.disabled=false;
        input.click();
      }
      input.disabled=true;
      input.setAttribute('aria-disabled','true');
      input.tabIndex=-1;
    };
    enforce();
    timer=window.setInterval(enforce,250);
    return()=>window.clearInterval(timer);
  },[]);
  return null;
}
