'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { contentsApi } from '@/lib/api/contents';
import { tagsApi } from '@/lib/api/tags';
import { Tag } from '@/lib/api/types';
import TipTapEditor from '@/components/TipTapEditor';

export default function PostCreatePage() {
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tagSaving, setTagSaving] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [editingTagNo, setEditingTagNo] = useState<number | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const plain = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    setSubTitle(plain.slice(0, 100));
  }, [body]);

  async function loadTags() {
    try {
      const res = await tagsApi.getList(1);
      const r = res as any;
      const list = r.list ?? r.data?.list ?? r.data?.content ?? [];
      setAllTags(list);
    } catch (e) {
      // 태그 목록 로딩 실패는 무시
    }
  }

  useEffect(() => {
    loadTags();
  }, []);

  async function addTag() {
    if (!newTagName.trim() || tagSaving) return;
    setTagSaving(true);
    try {
      await tagsApi.create({ tagName: newTagName.trim(), sort: 0 });
      setNewTagName('');
      await loadTags();
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
      await loadTags();
    } catch (e: any) {
      alert('태그 수정 실패: ' + e.message);
    } finally {
      setTagSaving(false);
    }
  }

  function toggleTag(tagNo: number) {
    if (selectedTags.includes(tagNo)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagNo));
    } else {
      setSelectedTags([...selectedTags, tagNo]);
    }
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
      const data = {
        title: title.trim(),
        subTitle: subTitle.trim(),
        body: body,
        tags: selectedTags.map((tagNo) => ({ tagNo })),
      };
      await contentsApi.create(data);
      router.push('/admin/contents');
    } catch (e: any) {
      setError(e.message || '저장 중 오류가 발생했습니다.');
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

      {error && <div className="p-3 mb-6 text-sm rounded-lg bg-danger/10 text-danger">{error}</div>}

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
                <label className="block text-sm font-medium text-text mb-1.5">
                  내용
                </label>
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
            <div className="p-6 border rounded-lg shadow-sm bg-card border-border">
              <h3 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text">태그</h3>

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
                        onClick={() => toggleTag(tag.tagNo)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                          ${selectedTags.includes(tag.tagNo) ? 'bg-primary text-white' : 'bg-bg text-text-light hover:bg-border'}`}
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
        </div>
      </form>
    </div>
  );
}
