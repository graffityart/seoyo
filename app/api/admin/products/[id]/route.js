import { NextResponse } from 'next/server';
import { isAdmin } from '../../../../../lib/admin-auth';
import { getDb } from '../../../../../lib/db';

export async function PATCH(request,{params}){
  if(!(await isAdmin())) return NextResponse.json({error:'권한이 없습니다.'},{status:401});
  const {id}=await params;
  const productId=Number(id);
  if(!Number.isInteger(productId)||productId<=0) return NextResponse.json({error:'잘못된 상품권입니다.'},{status:400});
  let body;
  try{ body=await request.json(); }catch{ return NextResponse.json({error:'잘못된 요청입니다.'},{status:400}); }
  const name=String(body.name||'').trim();
  const sortOrder=Number(body.sort_order);
  const isActive=Boolean(body.is_active);
  if(!name||name.length>100) return NextResponse.json({error:'상품권명을 확인해주세요.'},{status:400});
  if(!Number.isInteger(sortOrder)||sortOrder<0||sortOrder>9999) return NextResponse.json({error:'노출 순서를 확인해주세요.'},{status:400});
  const sql=getDb();
  const rows=await sql`
    UPDATE products
    SET name=${name},sort_order=${sortOrder},is_active=${isActive},updated_at=now()
    WHERE id=${productId}
    RETURNING id,name,slug,default_rate,is_active,sort_order
  `;
  if(!rows.length) return NextResponse.json({error:'상품권을 찾을 수 없습니다.'},{status:404});
  return NextResponse.json({ok:true,product:rows[0]});
}
