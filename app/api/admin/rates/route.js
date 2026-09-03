import { NextResponse } from 'next/server';
import { isAdmin } from '../../../../lib/admin-auth';
import { getDb } from '../../../../lib/db';

export async function POST(request){
  if(!(await isAdmin())) return NextResponse.json({message:'로그인이 필요합니다.'},{status:401});
  try{
    const body = await request.json();
    const productId = Number(body.productId);
    const rate = Number(body.rate);
    if(!Number.isInteger(productId) || !Number.isFinite(rate) || rate < 0 || rate > 100){
      return NextResponse.json({message:'매입률 값을 확인해 주세요.'},{status:400});
    }
    const sql = getDb();
    const result = await sql`
      UPDATE products
      SET default_rate=${rate}, updated_at=now()
      WHERE id=${productId} AND is_active=true
      RETURNING id, name, default_rate
    `;
    if(!result.length) return NextResponse.json({message:'상품권을 찾을 수 없습니다.'},{status:404});
    await sql`
      INSERT INTO product_rates(product_id, rate_percent, effective_from, is_active)
      VALUES(${productId}, ${rate}, now(), true)
    `;
    return NextResponse.json({ok:true, productId, rate:Number(result[0].default_rate)});
  }catch(error){
    console.error('Rate update failed', error);
    return NextResponse.json({message:'매입률 저장 중 오류가 발생했습니다.'},{status:500});
  }
}
