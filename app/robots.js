export default function robots(){
  return {
    rules:[{userAgent:'*',allow:'/',disallow:['/admin/','/api/']},{userAgent:'Yeti',allow:'/',disallow:['/admin/','/api/']},{userAgent:'Googlebot',allow:'/',disallow:['/admin/','/api/']}],
    sitemap:'https://www.pintoss.co.kr/sitemap.xml',
    host:'https://www.pintoss.co.kr'
  };
}
