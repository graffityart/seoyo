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
  const countRows=await sql`SELECT COUNT(*)::int AS count FROM notices`;
  if(Number(countRows[0]?.count||0)===0){
    await sql`INSERT INTO notices(title,content,is_published,is_pinned,created_at) VALUES
      ('사요 상품권 이용 안내','사요 상품권에서 지원하는 상품권 종류와 현재 매입률을 확인한 뒤 상품권별 입력 형식에 맞춰 신청해 주세요.',true,true,'2026-09-07T00:00:00+09:00'),
      ('상품권 매입 수수료 안내','상품권별 매입률은 운영 상황에 따라 변경될 수 있습니다. 메인 화면의 최신 매입률을 확인해 주세요.',true,false,'2026-09-01T00:00:00+09:00'),
      ('롯데 모바일상품권 접수 안내','롯데 모바일상품권은 안내된 번호 형식에 맞는 교환권만 접수됩니다. 접수 전 번호 형식을 확인해 주세요.',true,false,'2026-08-25T00:00:00+09:00'),
      ('상품권 PIN 입력 시 유의사항','상품권 PIN 번호는 오탈자 없이 정확하게 입력해 주세요. 이미 사용된 번호나 잘못 입력된 번호는 검수 과정에서 처리되지 않을 수 있습니다.',true,false,'2026-08-18T00:00:00+09:00'),
      ('내 주문 조회 이용방법','접수 시 입력한 휴대전화번호와 조회 비밀번호를 이용하면 내 주문 조회에서 처리상태를 확인할 수 있습니다.',true,false,'2026-08-11T00:00:00+09:00'),
      ('개인정보 처리방침 안내','상품권 접수 과정에서 수집되는 개인정보는 거래 처리와 고객지원 등 고지된 목적 범위에서 처리됩니다.',true,false,'2026-08-04T00:00:00+09:00')`;
  }
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
