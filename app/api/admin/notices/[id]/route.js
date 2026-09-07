import { NextResponse } from 'next/server';
import { isAdmin } from '../../../../../lib/admin-auth';
import { ensureNoticeTable } from '../../../../../lib/notice-db';
import { getDb } from '../../../../../lib/db';

export async function PATCH(request,{params}){
  if(!(await isAdmin())) return NextResponse.json({error:'권한이 없습니다.'},{status:401});
  const {id}=await params;
  const noticeId=Number(id);
  if(!Number.isInteger(noticeId)||noticeId<1) return NextResponse.json({error:'잘못된 공지번호입니다.'},{status:400});
  let body; try{body=await request.json();}catch{return NextResponse.json({error:'잘못된 요청입니다.'},{status:400});}
  const title=String(body.title||'').trim();
  const content=String(body.content||'').trim();
  const isPublished=Boolean(body.is_published);
  const isPinned=Boolean(body.is_pinned);
  if(!title||title.length>180) return NextResponse.json({error:'공지 제목을 확인해주세요.'},{status:400});
  if(content.length>20000) return NextResponse.json({error:'공지 내용이 너무 깁니다.'},{status:400});
  await ensureNoticeTable();
  const sql=getDb();
  await sql`UPDATE notices SET title=${title},content=${content},is_published=${isPublished},is_pinned=${isPinned},updated_at=now() WHERE id=${noticeId}`;
  return NextResponse.json({ok:true});
}

export async function DELETE(_request,{params}){
  if(!(await isAdmin())) return NextResponse.json({error:'권한이 없습니다.'},{status:401});
  const {id}=await params;
  const noticeId=Number(id);
  if(!Number.isInteger(noticeId)||noticeId<1) return NextResponse.json({error:'잘못된 공지번호입니다.'},{status:400});
  await ensureNoticeTable();
  const sql=getDb();
  await sql`DELETE FROM notices WHERE id=${noticeId}`;
  return NextResponse.json({ok:true});
}
