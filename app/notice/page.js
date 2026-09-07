import Link from 'next/link';
import { NOTICE_POSTS } from '../../lib/notices';

export const metadata={title:'공지사항 | 사요 상품권',description:'사요 상품권의 주요 공지사항과 이용 안내를 확인하세요.'};

export default function NoticePage(){return <main className="noticePage"><div className="noticePageWrap"><div className="noticePageTop"><Link href="/">← 사요 상품권 홈</Link><h1>공지사항</h1><p>서비스 이용과 상품권 접수에 필요한 주요 안내를 확인하세요.</p></div><div className="noticeListPage">{NOTICE_POSTS.map(post=><article className="noticePost" id={`notice-${post.id}`} key={post.id}><div className="noticePostHead"><h2>{post.title}</h2><time>{post.date}</time></div><p>{post.content}</p></article>)}</div></div></main>}
