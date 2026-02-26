'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import { contentsApi } from '@/lib/api/contents';
import { Content, ContentSearchType } from '@/lib/api/types';

export default function PostsListPage() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Content[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<ContentSearchType>('TITLE_CONTENT');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadPosts(page: number = 1) {
    setLoading(true);
    setError('');
    try {
      const res = await contentsApi.getList(page);
      if (res.data) {
        const data = res.data as any;
        const postList = data.content || data.list || (Array.isArray(data) ? data : []);
        setPosts(postList);
        setTotalCount(data.totalElements ?? data.count ?? data.totalCount ?? postList.length);
        setTotalPages(data.totalPages ?? (Math.ceil((data.totalElements ?? postList.length) / 10) || 1));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function searchPosts(type: ContentSearchType, query: string, page: number = 1) {
    setLoading(true);
    setError('');
    try {
      const res = await contentsApi.search(type, query, page);
      if (res.data) {
        const data = res.data as any;
        const postList = data.content || data.list || (Array.isArray(data) ? data : []);
        setPosts(postList);
        setTotalCount(data.totalElements ?? data.count ?? data.totalCount ?? postList.length);
        setTotalPages(data.totalPages ?? (Math.ceil((data.totalElements ?? postList.length) / 10) || 1));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const t = (searchParams.get('type') as ContentSearchType) ?? 'TITLE_CONTENT';
    if (q) {
      setSearchQuery(q);
      setSearchType(t);
      searchPosts(t, q, 1);
    } else {
      loadPosts(1);
    }
  }, [searchParams]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPage(1);
    if (searchQuery.trim()) {
      searchPosts(searchType, searchQuery, 1);
    } else {
      loadPosts(1);
    }
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    if (searchQuery.trim()) {
      searchPosts(searchType, searchQuery, page);
    } else {
      loadPosts(page);
    }
  }

  async function deletePost(ctntNo: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await contentsApi.delete(ctntNo);
      await loadPosts(currentPage);
    } catch (e: any) {
      alert('삭제 실패: ' + e.message);
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">게시물 관리</h1>
          <p className="mt-1 text-sm text-text-light">총 {totalCount}개의 게시물</p>
        </div>
        <Link
          href="/admin/contents/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium
            hover:bg-primary-hover transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          새 글 작성
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6 border rounded-lg shadow-sm bg-card border-border">
        <form onSubmit={handleSearch} className="flex gap-2 p-4">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as ContentSearchType)}
            className="px-3 py-2 text-sm border rounded-lg outline-none border-border text-text bg-bg"
          >
            <option value="TITLE_CONTENT">제목+내용</option>
            <option value="TITLE">제목</option>
            <option value="CONTENT">내용</option>
            <option value="TAG">태그</option>
          </select>
          <div className="flex items-center flex-1 px-3 py-2 border rounded-lg bg-bg border-border">
            <svg
              className="flex-shrink-0 w-4 h-4 mr-2 text-text-light"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색어를 입력하세요..."
              className="w-full text-sm bg-transparent border-none outline-none text-text"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-primary-hover"
          >
            검색
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); loadPosts(1); setCurrentPage(1); }}
              className="px-4 py-2 text-sm transition-colors border rounded-lg border-border text-text-light hover:bg-bg"
            >
              초기화
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-text-light">로딩 중...</div>
        </div>
      ) : error ? (
        <div className="p-4 text-sm rounded-lg bg-danger/10 text-danger">{error}</div>
      ) : (
        <div className="border rounded-lg shadow-sm bg-card border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="w-10 px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-light">
                    No
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-light">
                    제목
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-light">
                    작성자
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-light">
                    작성일
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-light">
                    수정일
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-light">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.ctntNo}
                    className="transition-colors border-b border-border last:border-b-0 hover:bg-bg/50"
                  >
                    <td className="px-6 py-3.5 text-sm text-text-light">{post.ctntNo}</td>
                    <td className="px-6 py-3.5">
                      <Link
                        href={`/admin/contents/${post.ctntNo}`}
                        className="text-sm font-medium transition-colors text-text hover:text-primary"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-text-light">{post.inpUser || '-'}</span>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-text-light">
                      {post.inpDttm ? new Date(post.inpDttm).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-text-light">
                      {post.updDttm ? new Date(post.updDttm).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/contents/${post.ctntNo}`}
                          className="p-1.5 text-text-light hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                          title="수정"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={() => deletePost(post.ctntNo)}
                          className="p-1.5 text-text-light hover:text-danger transition-colors rounded-lg hover:bg-danger/10"
                          title="삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {posts.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-text-light">게시물이 없습니다.</p>
            </div>
          )}

          <div className="px-6 py-4 border-t border-border">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </div>
      )}
    </div>
  );
}
