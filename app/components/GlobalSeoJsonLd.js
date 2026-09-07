export default function GlobalSeoJsonLd(){
  const website={
    '@context':'https://schema.org',
    '@type':'WebSite',
    '@id':'https://seoyo.kr/#website',
    url:'https://seoyo.kr/',
    name:'사요 상품권',
    alternateName:'사요 상품권(핀토스)',
    inLanguage:'ko-KR'
  };
  const organization={
    '@context':'https://schema.org',
    '@type':'Organization',
    '@id':'https://seoyo.kr/#organization',
    name:'사요 상품권(핀토스)',
    url:'https://seoyo.kr/',
    logo:'https://seoyo.kr/images/brand/seoyo-logo.webp',
    email:'admin@pin-toss.com',
    address:{
      '@type':'PostalAddress',
      postalCode:'47190',
      addressRegion:'부산광역시',
      addressLocality:'부산진구',
      streetAddress:'당감로17, 7동 906호(당감동)',
      addressCountry:'KR'
    }
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(website)}} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organization)}} />
  </>;
}
