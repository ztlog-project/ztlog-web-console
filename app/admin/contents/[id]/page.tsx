'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { contentsApi } from '@/lib/api/contents';
import { tagsApi } from '@/lib/api/tags';
import { Content, Tag } from '@/lib/api/types';
import TipTapEditor from '@/components/TipTapEditor';

export default function PostEditPage() {
  const params = useParams();
  const router = useRouter();
  const ctntNo = parseInt(params.id as string);

  const [post, setPost] = useState<Content | null>(null);
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tagSaving, setTagSaving] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [editingTagNo, setEditingTagNo] = useState<number | null>(null);
  const [editingTagName, setEditingTagName] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [contentRes, tagsRes] = await Promise.all([
          contentsApi.getDetail(ctntNo),
          tagsApi.getList(1),
        ]);

        if (contentRes.data) {
          const postData = contentRes.data as any;
          setPost(postData);
          setTitle(postData.title || '');
          const bodyContent = postData.body || postData.content || '';
          setBody(bodyContent);
          const subTitleValue = postData.subTitle ||
            bodyContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
          setSubTitle(subTitleValue);
          const linkedTags: any[] = postData.tags || postData.tagList || [];
          if (linkedTags.length > 0) {
            setSelectedTags(linkedTags.map((t: any) => t.tagNo));
          }
        }

        const tr = tagsRes as any;
        const tagList = tr.list ?? tr.data?.list ?? tr.data?.content ?? [];
        setAllTags(tagList);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [ctntNo]);

  async function reloadTags() {
    try {
      const res = await tagsApi.getList(1);
      const r = res as any;
      const list = r.list ?? r.data?.list ?? r.data?.content ?? [];
      setAllTags(list);
    } catch (e) {
      // ignore
    }
  }

  async function addTag() {
    if (!newTagName.trim() || tagSaving) return;
    setTagSaving(true);
    try {
      await tagsApi.create({ tagName: newTagName.trim(), sort: 0 });
      setNewTagName('');
      await reloadTags();
    } catch (e: any) {
      alert('태그 추가 실패: ' + e.message);
    } finally {
      setTagSaving(false);
    }
  }

  function startTagEdit(tag: Tag) {
    setEditingTagNo(tag.tagNo);
    setEditingTagName(tag.tagName);
  }

  async function saveTagEdit(tagNo: number) {
    if (!editingTagName.trim() || tagSaving) return;
    setTagSaving(true);
    try {
      await tagsApi.update({ tagNo, tagName: editingTagName.trim(), sort: 0 });
      setEditingTagNo(null);
      await reloadTags();
    } catch (e: any) {
      alert('태그 수정 실패: ' + e.message);
    } finally {
      setTagSaving(false);
    }
  }

  /**
   * TipTapEditor의 onChange에서 HTML과 함께 순수 텍스트를 받는 방식
   * 만약 컴포넌트 수정이 어렵다면 아래 useEffect에서 텍스트를 추출합니다.
   */
  const handleBodyChange = (html: string, plainText?: string) => {
    setBody(html);
    // TipTap의 getText() 결과물이 넘어온다면 바로 사용, 없으면 직접 추출
    const finalPlainText = plainText || html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    setSubTitle(finalPlainText.slice(0, 100));
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      await contentsApi.update({
        ctntNo,
        title: title.trim(),
        subTitle,
        body,
        tags: selectedTags.map((tagNo) => ({ tagNo })),
      } as any);
      router.push('/admin/contents');
    } catch (e: any) {
      setError(e.message || '수정 중 오류가 발생했습니다.');
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="p-6 border rounded-lg shadow-sm bg-card border-border">
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1.5">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg outline-none border-border focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">내용</label>
              <TipTapEditor 
                value={body} 
                onChange={handleBodyChange} // 수정된 핸들러 연결
                disabled={saving} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 border rounded-lg shadow-sm bg-card border-border">
            <h3 className="mb-4 text-sm font-semibold">태그 설정</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {allTags.map((tag) =>
                editingTagNo === tag.tagNo ? (
                  <div key={tag.tagNo} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editingTagName}
                      onChange={(e) => setEditingTagName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); saveTagEdit(tag.tagNo); }
                        if (e.key === 'Escape') setEditingTagNo(null);
                      }}
                      maxLength={15}
                      disabled={tagSaving}
                      autoFocus
                      className="px-2 py-1 text-xs border border-primary rounded-full w-24 bg-white focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => saveTagEdit(tag.tagNo)}
                      disabled={tagSaving}
                      className="p-1 text-success hover:bg-success/10 rounded transition-colors disabled:opacity-50"
                      title="저장"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTagNo(null)}
                      className="p-1 text-text-light hover:bg-bg rounded transition-colors"
                      title="취소"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div key={tag.tagNo} className="group flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setSelectedTags(prev =>
                        prev.includes(tag.tagNo) ? prev.filter(t => t !== tag.tagNo) : [...prev, tag.tagNo]
                      )}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedTags.includes(tag.tagNo) ? 'bg-primary text-white' : 'bg-bg text-text-light hover:bg-border'
                      }`}
                    >
                      {tag.tagName}
                    </button>
                    <button
                      type="button"
                      onClick={() => startTagEdit(tag)}
                      disabled={tagSaving}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-text-light hover:text-primary hover:bg-primary/10 disabled:opacity-0"
                      title="태그 수정"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                )
              )}
              {allTags.length === 0 && (
                <p className="text-sm text-text-light">등록된 태그가 없습니다.</p>
              )}
            </div>

            {/* 새 태그 추가 */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="새 태그 추가"
                maxLength={15}
                disabled={tagSaving}
                className="flex-1 px-3 py-1.5 text-xs border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={tagSaving || !newTagName.trim()}
                className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                추가
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50"
            >
              {saving ? '저장 중...' : '수정 완료'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
