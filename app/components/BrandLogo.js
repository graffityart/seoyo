export default function BrandLogo({className='',alt='사요 상품권'}){
  return <span className={`brandLogoImage ${className}`.trim()}><img src="/images/brand/seoyo-logo.webp" alt={alt}/></span>
}
