import { NextResponse } from 'next/server';
import { isAdmin } from '../../../../../lib/admin-auth';
import { getDb } from '../../../../../lib/db';

const allowed = new Set(['received','reviewing','paid','rejected']);

export async function PATCH(request,{params}){
  if(!(await isAdmin())) return NextResponse.json({message:'로그인이 필요합니다.'},{status:401});
  const {id}=await params;
  const body=await request.json();
  const status=String(body.status||'');
  let paidAmount=Math.max(0,Number(body.paidAmount||0));
  if(!allowed.has(status)) return NextResponse.json({message:'처리상태를 확인해 주세요.'},{status:400});
  if(status==='paid' && paidAmount<=0) return NextResponse.json({message:'입금완료 처리 시 실제 입금액을 입력해 주세요.'},{status:400});
  if(status==='rejected') paidAmount=0;
  const sql=getDb();
  const current=await sql`SELECT status FROM orders WHERE id=${id} AND deleted_at IS NULL`;
  if(!current.length) return NextResponse.json({message:'신청건을 찾을 수 없습니다.'},{status:404});
  await sql`UPDATE orders SET status=${status}, paid_amount=${paidAmount}, updated_at=now() WHERE id=${id}`;
  await sql`INSERT INTO order_history(order_id,previous_status,new_status,paid_amount,changed_by,reason) VALUES(${id},${current[0].status},${status},${paidAmount},'admin','관리자 처리상태 변경')`;
  return NextResponse.json({ok:true});
}

export async function DELETE(_request,{params}){
  if(!(await isAdmin())) return NextResponse.json({message:'로그인이 필요합니다.'},{status:401});
  const {id}=await params;
  const sql=getDb();
  const rows=await sql`UPDATE orders SET deleted_at=now(), updated_at=now() WHERE id=${id} AND deleted_at IS NULL RETURNING id,status`;
  if(!rows.length) return NextResponse.json({message:'신청건을 찾을 수 없습니다.'},{status:404});
  await sql`INSERT INTO order_history(order_id,previous_status,new_status,changed_by,reason) VALUES(${id},${rows[0].status},'deleted','admin','관리자 신청건 삭제')`;
  return NextResponse.json({ok:true});
}
