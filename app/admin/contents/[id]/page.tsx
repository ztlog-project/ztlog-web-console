'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { contentsApi } from '@/lib/api/contents';
import { Content } from '@/lib/api/types';
import TipTapEditor from '@/components/TipTapEditor';
import TagSelector from '@/components/TagSelector';
import { flattenCategories } from '@/lib/utils/category';
import { useCategoryList } from '@/lib/hooks/useCategoryList';

export default function PostEditPage() {
  const params = useParams();
  const router = useRouter();
  const ctntNo = parseInt(params.id as string);

  const [post, setPost] = useState<Content | null>(null);
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedCateNo, setSelectedCateNo] = useState<number | null>(null);
  const { categories: allCategories } = useCategoryList();

  useEffect(() => {
    async function loadData() {
      try {
        const contentRes = await contentsApi.getDetail(ctntNo);

        if (contentRes.data) {
          const postData = contentRes.data;
          setPost(postData);
          setTitle(postData.title || '');
          const bodyContent = postData.body || postData.content || '';
          setBody(bodyContent);
          const subTitleValue = postData.subTitle ||
            bodyContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
          setSubTitle(subTitleValue);
          const linkedTags = postData.tags || postData.tagList || [];
          if (linkedTags.length > 0) {
            setSelectedTags(linkedTags.map(t => t.tagNo));
          }
          if (postData.cateNo) setSelectedCateNo(postData.cateNo);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [ctntNo]);

  function handleBodyChange(html: string) {
    setBody(html);
    const plain = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    setSubTitle(plain.slice(0, 100));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await contentsApi.update({
        ctntNo,
        title: title.trim(),
        subTitle,
        body,
        cateNo: selectedCateNo,
        tags: selectedTags.map(tagNo => ({ tagNo })),
      });
      router.push('/admin/contents');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '수정 중 오류가 발생했습니다.');
      setSaving(false);
    }
  }

  if (loading) return <div className="py-20 text-center text-text-light">로딩 중...</div>;
  if (!post) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">게시물 수정 (ID: {ctntNo})</h1>
        <Link href="/admin/contents" className="text-sm text-text-light hover:underline">목록으로</Link>
      </div>

      {error && <div className="p-3 mb-6 text-sm rounded-lg bg-danger/10 text-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="p-6 border rounded-lg shadow-sm bg-card border-border">
            <div className="mb-5">
              <label className="block text-sm font-medium text-text mb-1.5">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg outline-none border-border focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">내용</label>
              <TipTapEditor value={body} onChange={handleBodyChange} disabled={saving} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 카테고리 */}
          <div className="p-6 border rounded-lg shadow-sm bg-card border-border">
            <h3 className="mb-4 text-sm font-semibold text-text">카테고리</h3>
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
            <h3 className="mb-4 text-sm font-semibold text-text">태그 설정</h3>
            <TagSelector
              selectedTags={selectedTags}
              onChange={setSelectedTags}
              disabled={saving}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? '저장 중...' : '수정 완료'}
          </button>
        </div>
      </form>
    </div>
  );
}
