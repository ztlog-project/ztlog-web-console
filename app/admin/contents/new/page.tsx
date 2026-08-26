'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { contentsApi } from '@/lib/api/contents';
import TipTapEditor from '@/components/TipTapEditor';
import { flattenCategories } from '@/lib/utils/category';
import { markdownToPlainText } from '@/lib/utils/text';
import DOMPurify from 'dompurify';
import { useCategoryList } from '@/lib/hooks/useCategoryList';
import { useDraftAutosave, hasUnsavedContent } from '@/lib/hooks/useDraftAutosave';
import AlertMessage from '@/components/AlertMessage';
import DraftRestoreBanner from '@/components/DraftRestoreBanner';
import AutosaveStatus from '@/components/AutosaveStatus';
import PostSettingsDrawer from '@/components/PostSettingsDrawer';
import BlogPreview from '@/components/BlogPreview';

const DRAFT_KEY = 'ztlog:draft:contents:new';

export default function PostCreatePage() {
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedCateNo, setSelectedCateNo] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { categories: allCategories, error: categoryError } = useCategoryList();
  const router = useRouter();
  const { pendingDraft, lastSavedAt, saveDraft, clearDraft, dismissDraft } = useDraftAutosave(DRAFT_KEY);

  useEffect(() => {
    setSubTitle(markdownToPlainText(body));
  }, [body]);

  // 세션 만료 등으로 작성 내용이 사라지지 않도록 로컬에 자동 임시저장
  useEffect(() => {
    saveDraft({ title, subTitle, body, cateNo: selectedCateNo, tagNos: selectedTags });
  }, [title, subTitle, body, selectedCateNo, selectedTags, saveDraft]);

  // 저장하지 않은 내용이 있는 상태로 탭을 닫거나 이동하면 경고
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (saving || !hasUnsavedContent(title, body)) return;
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [title, body, saving]);

  function restoreDraft() {
    if (!pendingDraft) return;
    setTitle(pendingDraft.title);
    setSubTitle(pendingDraft.subTitle);
    setBody(pendingDraft.body);
    setSelectedCateNo(pendingDraft.cateNo);
    setSelectedTags(pendingDraft.tagNos);
    dismissDraft();
  }

  function openPublishSettings() {
    if (!title.trim() || !body.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }
    setError('');
    setDrawerOpen(true);
  }

  async function submitPost() {
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
      clearDraft();
      router.push('/admin/contents');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.');
      setDrawerOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* 상단 앱바 */}
      <div className="sticky top-16 z-20 -mx-6 mb-4 flex items-center justify-between gap-4 border-b border-border bg-bg/95 px-6 py-3 backdrop-blur">
        <Link
          href="/admin/contents"
          className="flex items-center gap-1 text-sm text-text-light hover:text-text transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          목록
        </Link>
        <div className="flex items-center gap-4">
          <AutosaveStatus lastSavedAt={lastSavedAt} />
          <button
            type="button"
            onClick={() => setShowPreview(p => !p)}
            aria-pressed={showPreview}
            className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors
              ${showPreview ? 'bg-primary/10 text-primary' : 'text-text-light hover:bg-bg hover:text-text'}`}
          >
            미리보기
          </button>
          <button
            type="button"
            onClick={openPublishSettings}
            disabled={saving}
            className="px-4 py-1.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            발행
          </button>
        </div>
      </div>

      <div className={showPreview ? 'grid grid-cols-1 xl:grid-cols-2 gap-10 max-w-[1440px] mx-auto' : 'max-w-[760px] mx-auto'}>
        <div>
          {pendingDraft && (
            <DraftRestoreBanner savedAt={pendingDraft.savedAt} onRestore={restoreDraft} onDiscard={clearDraft} />
          )}

          {error && <AlertMessage message={error} />}

          <label htmlFor="title" className="sr-only">제목</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={100}
            disabled={saving}
            className="w-full py-2 bg-transparent text-3xl md:text-4xl font-bold text-text placeholder:text-text-light/60 focus:outline-none disabled:opacity-50"
          />

          <TipTapEditor
            value={body}
            onChange={setBody}
            disabled={saving}
            placeholder="이야기를 들려주세요..."
          />
        </div>

        {showPreview && (
          <div className="xl:border-l xl:border-border xl:pl-10">
            <BlogPreview title={title} markdown={body} />
          </div>
        )}
      </div>

      <PostSettingsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        heading="발행 설정"
        categories={flattenCategories(allCategories)}
        categoryError={categoryError}
        selectedCateNo={selectedCateNo}
        onCateNoChange={setSelectedCateNo}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        onSubmit={submitPost}
        submitLabel="발행"
        saving={saving}
      />
    </div>
  );
}
