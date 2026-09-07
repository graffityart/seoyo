import { NextResponse } from 'next/server';
import { isAdmin } from '../../../../lib/admin-auth';
import { ensureNoticeTable } from '../../../../lib/notice-db';
import { getDb } from '../../../../lib/db';

export async function POST(request){
  if(!(await isAdmin())) return NextResponse.json({error:'권한이 없습니다.'},{status:401});
  let body; try{body=await request.json();}catch{return NextResponse.json({error:'잘못된 요청입니다.'},{status:400});}
  const title=String(body.title||'').trim();
  const content=String(body.content||'').trim();
  const isPublished=body.is_published!==false;
  const isPinned=Boolean(body.is_pinned);
  if(!title||title.length>180) return NextResponse.json({error:'공지 제목을 확인해주세요.'},{status:400});
  if(content.length>20000) return NextResponse.json({error:'공지 내용이 너무 깁니다.'},{status:400});
  await ensureNoticeTable();
  const sql=getDb();
  const rows=await sql`INSERT INTO notices(title,content,is_published,is_pinned) VALUES(${title},${content},${isPublished},${isPinned}) RETURNING id`;
  return NextResponse.json({ok:true,id:Number(rows[0].id)});
}
