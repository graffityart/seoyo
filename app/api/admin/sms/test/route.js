import {NextResponse} from 'next/server';
import {isAdmin} from '../../../../../lib/admin-auth';
import {normalizePhone,sendAndLogSms} from '../../../../../lib/icode';
export async function POST(request){
  if(!(await isAdmin()))return NextResponse.json({message:'로그인이 필요합니다.'},{status:401});
  try{const body=await request.json();const phone=normalizePhone(body.phone);const message=String(body.message||'').trim();if(!phone||!message)return NextResponse.json({message:'수신번호와 내용을 입력해 주세요.'},{status:400});const result=await sendAndLogSms({recipientType:'test',phone,eventType:'admin_test',message});return NextResponse.json({ok:result.success||result.pending,code:result.code,status:result.status})}catch(e){return NextResponse.json({message:e.message||'문자 발송에 실패했습니다.'},{status:500})}
}
