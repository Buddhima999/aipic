import { useEffect, useRef } from 'react';
const publisher=import.meta.env.VITE_ADSENSE_CLIENT;
const slot=import.meta.env.VITE_ADSENSE_SLOT;
// Enable only after approval and after the required consent flow is configured.
const enabled=import.meta.env.VITE_ADSENSE_ENABLED==='true' && /^ca-pub-\d{16}$/.test(publisher||'') && /^\d+$/.test(slot||'');
export default function AdSlot(){
 const requested=useRef(false);
 useEffect(()=>{
 if(!enabled||requested.current)return;
 function show(){if(requested.current)return;requested.current=true;try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){console.warn('Ad unavailable');}}
 let script=document.getElementById('aipic-adsense');
 if(!script){script=document.createElement('script');script.id='aipic-adsense';script.async=true;script.crossOrigin='anonymous';script.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`;script.addEventListener('load',show,{once:true});document.head.appendChild(script);}
 else if(window.adsbygoogle)show();else script.addEventListener('load',show,{once:true});
 return()=>script.removeEventListener('load',show);
 },[]);
 if(!enabled)return null;
 return <aside className="ad-placement" aria-label="Advertisement"><small>Advertisement</small><ins className="adsbygoogle" style={{display:'block'}} data-ad-client={publisher} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true"/></aside>;
}
