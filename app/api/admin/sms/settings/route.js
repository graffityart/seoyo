import {NextResponse} from 'next/server';
import {isAdmin} from '../../../../../lib/admin-auth';
import {saveSmsSettings,SMS_DEFAULTS} from '../../../../../lib/icode';
export async function POST(request){
  if(!(await isAdmin()))return NextResponse.json({message:'로그인이 필요합니다.'},{status:401});
  try{const body=await request.json();const clean={};for(const k of Object.keys(SMS_DEFAULTS)){if(k in body)clean[k]=body[k]}await saveSmsSettings(clean);return NextResponse.json({ok:true})}catch(e){console.error(e);return NextResponse.json({message:'문자 설정 저장 중 오류가 발생했습니다.'},{status:500})}
}
