'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { contentsApi } from '@/lib/api/contents';
import TipTapEditor from '@/components/TipTapEditor';
import TagSelector from '@/components/TagSelector';
import { flattenCategories } from '@/lib/utils/category';
import { htmlToPlainText } from '@/lib/utils/text';
import DOMPurify from 'dompurify';
import { useCategoryList } from '@/lib/hooks/useCategoryList';
import AlertMessage from '@/components/AlertMessage';

export default function PostCreatePage() {
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedCateNo, setSelectedCateNo] = useState<number | null>(null);
  const { categories: allCategories, error: categoryError } = useCategoryList();
  const router = useRouter();

  useEffect(() => {
    setSubTitle(htmlToPlainText(body));
  }, [body]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const safeBody = typeof window !== 'undefined' ? DOMPurify.sanitize(body) : body;
      await contentsApi.create({
        title: title.trim(),
        subTitle: subTitle.trim(),
        body: safeBody,
        cateNo: selectedCateNo,
        tags: selectedTags.map(tagNo => ({ tagNo })),
      });
      router.push('/admin/contents');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">새 글 작성</h1>
          <p className="mt-1 text-sm text-text-light">새로운 블로그 게시물을 작성합니다</p>
        </div>
        <Link
          href="/admin/contents"
          className="flex items-center gap-1 text-sm transition-colors text-text-light hover:text-text"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          목록으로
        </Link>
      </div>

      {error && <AlertMessage message={error} />}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 xl:col-span-2">
            <div className="p-6 border rounded-lg shadow-sm bg-card border-border">
              <div className="mb-5">
                <label htmlFor="title" className="block text-sm font-medium text-text mb-1.5">
                  제목
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="게시물 제목을 입력하세요"
                  maxLength={100}
                  required
                  disabled={saving}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm text-text bg-white
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors
                    disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">내용</label>
                <TipTapEditor
                  value={body}
                  onChange={setBody}
                  disabled={saving}
                  placeholder="게시물 내용을 입력하세요..."
                />
              </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            {/* 카테고리 */}
            <div className="p-6 border rounded-lg shadow-sm bg-card border-border">
              <h3 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text">카테고리</h3>
              {categoryError && (
                <p className="mb-2 text-xs text-danger">{categoryError}</p>
              )}
              <select
                value={selectedCateNo ?? ''}
                onChange={(e) => setSelectedCateNo(e.target.value ? Number(e.target.value) : null)}
                disabled={saving}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
              >
                <option value="">카테고리 없음</option>
                {flattenCategories(allCategories).map((cat) => (
                  <option key={cat.cateNo} value={cat.cateNo}>
                    {'\u00A0\u00A0'.repeat(cat._depth)}{cat.cateNm}
                  </option>
                ))}
              </select>
            </div>

            {/* 태그 */}
            <div className="p-6 border rounded-lg shadow-sm bg-card border-border">
              <h3 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text">태그</h3>
              <TagSelector
                selectedTags={selectedTags}
                onChange={setSelectedTags}
                disabled={saving}
              />
            </div>

            {/* 액션 */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-primary text-white rounded-lg font-medium text-sm
                  hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
              <Link
                href="/admin/contents"
                className="flex-1 py-2.5 bg-bg text-text-light rounded-lg font-medium text-sm text-center
                  hover:bg-border transition-colors flex items-center justify-center"
              >
                취소
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
