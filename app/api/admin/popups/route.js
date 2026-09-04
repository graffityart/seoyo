import { NextResponse } from 'next/server';
import { isAdmin } from '../../../../lib/admin-auth';
import { getDb } from '../../../../lib/db';

function safeUrl(value){
  const v=String(value||'').trim();
  if(!v) return '';
  if(v.startsWith('/')) return v;
  try{ const u=new URL(v); return ['http:','https:'].includes(u.protocol)?v:''; }catch{ return ''; }
}
function parseDate(value){
  if(!value) return null;
  const d=new Date(value);
  return Number.isNaN(d.getTime())?null:d.toISOString();
}

export async function POST(request){
  if(!(await isAdmin())) return NextResponse.json({error:'권한이 없습니다.'},{status:401});
  let body; try{ body=await request.json(); }catch{ return NextResponse.json({error:'잘못된 요청입니다.'},{status:400}); }
  const title=String(body.title||'').trim();
  const content=String(body.content||'').trim();
  const imageUrl=safeUrl(body.image_url);
  const mobileImageUrl=safeUrl(body.mobile_image_url);
  const linkUrl=safeUrl(body.link_url);
  const isActive=Boolean(body.is_active);
  const sortOrder=Number(body.sort_order||0);
  const startAt=parseDate(body.start_at);
  const endAt=parseDate(body.end_at);
  if(!title||title.length>120) return NextResponse.json({error:'팝업 제목을 확인해주세요.'},{status:400});
  if(content.length>5000) return NextResponse.json({error:'팝업 내용이 너무 깁니다.'},{status:400});
  if(body.image_url && !imageUrl) return NextResponse.json({error:'PC 이미지 URL을 확인해주세요.'},{status:400});
  if(body.mobile_image_url && !mobileImageUrl) return NextResponse.json({error:'모바일 이미지 URL을 확인해주세요.'},{status:400});
  if(body.link_url && !linkUrl) return NextResponse.json({error:'클릭 링크를 확인해주세요.'},{status:400});
  if(!Number.isInteger(sortOrder)||sortOrder<0||sortOrder>9999) return NextResponse.json({error:'노출 순서를 확인해주세요.'},{status:400});
  if(startAt&&endAt&&new Date(startAt)>new Date(endAt)) return NextResponse.json({error:'노출 종료일은 시작일 이후여야 합니다.'},{status:400});
  const sql=getDb();
  const rows=await sql`INSERT INTO site_popups(title,content,image_url,mobile_image_url,link_url,is_active,start_at,end_at,sort_order) VALUES(${title},${content},${imageUrl||null},${mobileImageUrl||null},${linkUrl||null},${isActive},${startAt},${endAt},${sortOrder}) RETURNING id`;
  return NextResponse.json({ok:true,id:Number(rows[0].id)});
}
