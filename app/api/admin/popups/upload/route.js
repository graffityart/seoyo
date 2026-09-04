import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { isAdmin } from '../../../../../lib/admin-auth';

const ALLOWED_TYPES = new Set(['image/jpeg','image/png','image/webp']);
const MAX_SIZE = 4 * 1024 * 1024;

export async function POST(request){
  if(!(await isAdmin())) return NextResponse.json({error:'권한이 없습니다.'},{status:401});
  try{
    const form=await request.formData();
    const file=form.get('file');
    const kind=String(form.get('kind')||'pc')==='mobile'?'mobile':'pc';
    if(!file || typeof file==='string') return NextResponse.json({error:'이미지를 선택해 주세요.'},{status:400});
    if(!ALLOWED_TYPES.has(file.type)) return NextResponse.json({error:'JPG, PNG, WebP 이미지만 업로드할 수 있습니다.'},{status:400});
    if(file.size<=0 || file.size>MAX_SIZE) return NextResponse.json({error:'이미지는 4MB 이하로 업로드해 주세요.'},{status:400});
    const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
    const blob=await put(`popups/${kind}-${Date.now()}-${crypto.randomUUID()}.${ext}`,file,{access:'public',addRandomSuffix:false});
    return NextResponse.json({ok:true,url:blob.url});
  }catch(error){
    console.error('Popup image upload failed',error);
    return NextResponse.json({error:'이미지 업로드에 실패했습니다. Blob 연결 설정을 확인해 주세요.'},{status:500});
  }
}
