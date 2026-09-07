import { getDb } from './db';

let ensured=false;
export async function ensureNoticeTable(){
  if(ensured) return;
  const sql=getDb();
  await sql`CREATE TABLE IF NOT EXISTS notices (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  ensured=true;
}

export async function getNotices({publishedOnly=true,limit=50}={}){
  await ensureNoticeTable();
  const sql=getDb();
  const safeLimit=Math.min(100,Math.max(1,Number(limit)||50));
  if(publishedOnly){
    return sql`SELECT id,title,content,is_published,is_pinned,created_at,updated_at FROM notices WHERE is_published=true ORDER BY is_pinned DESC,created_at DESC,id DESC LIMIT ${safeLimit}`;
  }
  return sql`SELECT id,title,content,is_published,is_pinned,created_at,updated_at FROM notices ORDER BY is_pinned DESC,created_at DESC,id DESC LIMIT ${safeLimit}`;
}

export function formatNoticeDate(value){
  const d=new Date(value);
  if(Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d).replace(/\s/g,'');
}
