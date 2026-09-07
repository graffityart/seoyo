export default function sitemap(){
  const base='https://seoyo.kr';
  const paths=['','/live','/notice','/privacy','/terms','/cash/cultureland','/cash/online-culture','/cash/teencash','/cash/booknlife','/cash/lotte-mobile','/cash/google-giftcard'];
  return paths.map((path,i)=>({
    url:`${base}${path}`,
    lastModified:new Date(),
    changeFrequency:i===0?'daily':path.startsWith('/cash/')?'weekly':'monthly',
    priority:i===0?1:path.startsWith('/cash/')?0.9:0.7
  }));
}
