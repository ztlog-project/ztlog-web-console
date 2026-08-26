'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { contentsApi } from '@/lib/api/contents';
import { Content } from '@/lib/api/types';
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

export default function PostEditPage() {
  const params = useParams();
  const router = useRouter();
  const ctntNo = Number(params.id);

  const [post, setPost] = useState<Content | null>(null);
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedCateNo, setSelectedCateNo] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { categories: allCategories, error: categoryError } = useCategoryList();
  const { pendingDraft, lastSavedAt, saveDraft, clearDraft, dismissDraft } = useDraftAutosave(`ztlog:draft:contents:edit:${ctntNo}`);

  useEffect(() => {
    if (isNaN(ctntNo)) {
      router.push('/admin/contents');
      return;
    }
    async function loadData() {
      try {
        const contentRes = await contentsApi.getDetail(ctntNo);

        if (contentRes.data) {
          const postData = contentRes.data;
          setPost(postData);
          setTitle(postData.title || '');
          const bodyContent = postData.body || postData.content || '';
          setBody(bodyContent);
          const subTitleValue = postData.subTitle || markdownToPlainText(bodyContent);
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

  function handleBodyChange(markdown: string) {
    setBody(markdown);
    setSubTitle(markdownToPlainText(markdown));
  }

  // 게시물 로딩이 끝나고, 복구 여부를 아직 결정하지 않은 임시저장 내용이 없을 때만 자동 임시저장 시작
  // (그렇지 않으면 서버에서 막 불러온 내용이 곧바로 로컬 임시저장 내용을 덮어써 복구할 수 없게 됨)
  useEffect(() => {
    if (loading || pendingDraft) return;
    saveDraft({ title, subTitle, body, cateNo: selectedCateNo, tagNos: selectedTags });
  }, [loading, pendingDraft, title, subTitle, body, selectedCateNo, selectedTags, saveDraft]);

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
      await contentsApi.update({
        ctntNo,
        title: title.trim(),
        subTitle,
        body: safeBody,
        cateNo: selectedCateNo,
        tags: selectedTags.map(tagNo => ({ tagNo })),
      });
      clearDraft();
      router.push('/admin/contents');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '수정 중 오류가 발생했습니다.');
      setDrawerOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="py-20 text-center text-text-light">
        로딩 중...
      </div>
    );
  }
  if (!post) return null;

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
            수정 완료
          </button>
        </div>
      </div>

      <div className={showPreview ? 'grid grid-cols-1 xl:grid-cols-2 gap-10 max-w-[1440px] mx-auto' : 'max-w-[760px] mx-auto'}>
        <div>
          {pendingDraft && (
            <DraftRestoreBanner savedAt={pendingDraft.savedAt} onRestore={restoreDraft} onDiscard={clearDraft} />
          )}

          {error && <AlertMessage message={error} />}

          <label htmlFor="edit-title" className="sr-only">제목</label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={100}
            disabled={saving}
            className="w-full py-2 bg-transparent text-3xl md:text-4xl font-bold text-text placeholder:text-text-light/60 focus:outline-none disabled:opacity-50"
          />

          <TipTapEditor value={body} onChange={handleBodyChange} disabled={saving} />
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
        heading="수정 설정"
        categories={flattenCategories(allCategories)}
        categoryError={categoryError}
        selectedCateNo={selectedCateNo}
        onCateNoChange={setSelectedCateNo}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        onSubmit={submitPost}
        submitLabel="수정 완료"
        saving={saving}
      />
    </div>
  );
}
