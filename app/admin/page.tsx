'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatCard from '@/components/StatCard';
import AlertMessage from '@/components/AlertMessage';
import { dashboardApi } from '@/lib/api/dashboard';
import { contentsApi } from '@/lib/api/contents';
import { tagsApi } from '@/lib/api/tags';
import { Content, Tag } from '@/lib/api/types';

interface Stats {
  totalPosts: number;
  totalTags: number;
  totalViews: number;
  totalComments: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalTags: 0,
    totalViews: 0,
    totalComments: 0,
  });
  const [recentPosts, setRecentPosts] = useState<Content[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [mainRes, contentsRes, tagsRes] = await Promise.all([
          dashboardApi.getMain(),
          contentsApi.getList(1),
          tagsApi.getList(1),
        ]);

        if (mainRes.data) {
          const d = mainRes.data as any;
          setStats({
            totalPosts: d.totalPostCount ?? d.totalPosts ?? 0,
            totalTags: d.totalTagCount ?? d.totalTags ?? 0,
            totalViews: d.totalViewCount ?? d.totalViews ?? 0,
            totalComments: d.totalCommentCount ?? d.totalComments ?? 0,
          });
        }

        if (contentsRes.data) {
          const data = contentsRes.data as any;
          const list = data.list || data.content || [];
          setRecentPosts(list.slice(0, 5));
        }

        if (tagsRes.data) {
          const data = tagsRes.data as any;
          setTags(data.list || data.content || []);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text">대시보드</h1>
          <p className="text-sm text-text-light mt-1">블로그 현황을 한눈에 확인하세요</p>
        </div>
        <div role="status" aria-live="polite" className="flex items-center justify-center py-20">
          <div className="text-text-light">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text">대시보드</h1>
          <p className="text-sm text-text-light mt-1">블로그 현황을 한눈에 확인하세요</p>
        </div>
        <AlertMessage message={error} />
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">대시보드</h1>
        <p className="text-sm text-text-light mt-1">블로그 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard title="총 게시물" value={stats.totalPosts} icon="article" color="primary" />
        <StatCard title="태그" value={stats.totalTags} icon="category" color="success" />
        <StatCard title="총 조회수" value={stats.totalViews} icon="eye" />
        <StatCard title="댓글" value={stats.totalComments} icon="comment" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="xl:col-span-2 bg-card rounded-lg shadow-sm border border-border">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">최근 게시물</h2>
            <Link href="/admin/contents" className="text-sm text-primary hover:text-primary-hover transition-colors">
              전체보기
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="text-left text-xs font-medium text-text-light uppercase tracking-wider px-6 py-3">
                    제목
                  </th>
                  <th scope="col" className="text-left text-xs font-medium text-text-light uppercase tracking-wider px-6 py-3">
                    작성자
                  </th>
                  <th scope="col" className="text-left text-xs font-medium text-text-light uppercase tracking-wider px-6 py-3">
                    작성일
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post) => (
                  <tr
                    key={post.ctntNo}
                    className="border-b border-border last:border-b-0 hover:bg-bg/50 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <Link
                        href={`/admin/contents/${post.ctntNo}`}
                        className="text-sm text-text hover:text-primary transition-colors font-medium"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-text-light">{post.inpUser || '-'}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-text-light">
                        {post.inpDttm ? new Date(post.inpDttm).toLocaleDateString('ko-KR') : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentPosts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-text-light text-sm">
                      게시물이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tag List */}
        <div className="bg-card rounded-lg shadow-sm border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text">태그 목록</h2>
          </div>
          <div className="p-6">
            {tags.length > 0 ? (
              <ul className="space-y-4">
                {tags.map((tag) => (
                  <li key={tag.tagNo} className="flex items-center justify-between">
                    <span className="text-sm text-text">{tag.tagName}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {(tag as any).tagCount ?? 0}개 게시물
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-light text-center">태그가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
