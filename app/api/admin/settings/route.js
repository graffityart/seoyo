import { NextResponse } from 'next/server';
import { isAdmin } from '../../../../lib/admin-auth';
import { getDb } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(request) {
  if(!(await isAdmin())) return NextResponse.json({ message:'권한이 없습니다.' }, { status:401 });
  try {
    const body = await request.json();
    const minimumOrderAmount = Number(body.minimumOrderAmount);
    const transferFee = Number(body.transferFee);
    const liveOrderLimit = Number(body.liveOrderLimit);
    const rateNotice = String(body.rateNotice || '').trim();
    if(!Number.isInteger(minimumOrderAmount) || minimumOrderAmount < 1000) return NextResponse.json({message:'최소 교환금액을 확인해 주세요.'},{status:400});
    if(!Number.isInteger(transferFee) || transferFee < 0) return NextResponse.json({message:'이체수수료를 확인해 주세요.'},{status:400});
    if(!Number.isInteger(liveOrderLimit) || liveOrderLimit < 1 || liveOrderLimit > 30) return NextResponse.json({message:'실시간 노출 건수는 1~30건으로 설정해 주세요.'},{status:400});
    if(!rateNotice || rateNotice.length > 120) return NextResponse.json({message:'안내문구를 확인해 주세요.'},{status:400});
    const sql = getDb();
    await sql`
      INSERT INTO service_settings(setting_key,setting_value,value_type,label,updated_at) VALUES
      ('minimum_order_amount',${String(minimumOrderAmount)},'number','최소 교환금액',now()),
      ('transfer_fee',${String(transferFee)},'number','이체수수료',now()),
      ('rate_notice',${rateNotice},'text','메인 매입률 안내문구',now()),
      ('live_order_limit',${String(liveOrderLimit)},'number','실시간 매입현황 노출 건수',now())
      ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value, value_type=EXCLUDED.value_type, label=EXCLUDED.label, updated_at=now()
    `;
    return NextResponse.json({ok:true});
  } catch(error) {
    console.error('Settings update failed', error);
    return NextResponse.json({message:'운영 설정 저장 중 오류가 발생했습니다.'},{status:500});
  }
}
