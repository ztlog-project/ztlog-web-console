'use client';

import { useEffect, useState } from 'react';
import { tagsApi } from '@/lib/api/tags';
import { Tag, pageItems } from '@/lib/api/types';

interface TagSelectorProps {
  selectedTags: number[];
  onChange: (tags: number[]) => void;
  disabled?: boolean;
}

export default function TagSelector({ selectedTags, onChange, disabled }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [editingTagNo, setEditingTagNo] = useState<number | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [tagSaving, setTagSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadTags() {
    try {
      const firstRes = await tagsApi.getList(1);
      const firstData = firstRes.data;
      const firstList = firstData ? pageItems(firstData) : [];
      const totalPages = firstData?.totalPages ?? 1;

      if (totalPages <= 1) {
        setAllTags(firstList);
        return;
      }

      const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) => tagsApi.getList(i + 2))
      );
      const allLists = rest.flatMap(res => res.data ? pageItems(res.data) : []);
      setAllTags([...firstList, ...allLists]);
    } catch {
      // 태그 목록 로딩 실패는 무시
    }
  }

  useEffect(() => { loadTags(); }, []);

  function toggleTag(tagNo: number) {
    onChange(
      selectedTags.includes(tagNo)
        ? selectedTags.filter(t => t !== tagNo)
        : [...selectedTags, tagNo]
    );
  }

  async function addTag() {
    if (!newTagName.trim() || tagSaving) return;
    setTagSaving(true);
    setError('');
    try {
      await tagsApi.create({ tagName: newTagName.trim(), sort: 0 });
      setNewTagName('');
      await loadTags();
    } catch (e: unknown) {
      setError('태그 추가 실패: ' + (e instanceof Error ? e.message : '오류가 발생했습니다.'));
    } finally {
      setTagSaving(false);
    }
  }

  async function saveTagEdit(tagNo: number) {
    if (!editingTagName.trim() || tagSaving) return;
    setTagSaving(true);
    setError('');
    try {
      await tagsApi.update({ tagNo, tagName: editingTagName.trim(), sort: 0 });
      setEditingTagNo(null);
      await loadTags();
    } catch (e: unknown) {
      setError('태그 수정 실패: ' + (e instanceof Error ? e.message : '오류가 발생했습니다.'));
    } finally {
      setTagSaving(false);
    }
  }

  return (
    <div>
      {error && (
        <p className="text-xs text-danger mb-2">{error}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {allTags.map(tag =>
          editingTagNo === tag.tagNo ? (
            <div key={tag.tagNo} className="flex items-center gap-1">
              <input
                type="text"
                value={editingTagName}
                onChange={e => setEditingTagName(e.target.value)}
                onKeyDown={e => {
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
                disabled={disabled}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                  ${selectedTags.includes(tag.tagNo)
                    ? 'bg-primary text-white'
                    : 'bg-bg text-text-light hover:bg-border'}`}
              >
                {tag.tagName}
              </button>
              <button
                type="button"
                onClick={() => { setEditingTagNo(tag.tagNo); setEditingTagName(tag.tagName); }}
                disabled={tagSaving || disabled}
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

      <div className="flex gap-2">
        <input
          type="text"
          value={newTagName}
          onChange={e => setNewTagName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder="새 태그 추가"
          maxLength={15}
          disabled={tagSaving || disabled}
          className="flex-1 px-3 py-1.5 text-xs border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={tagSaving || !newTagName.trim() || disabled}
          className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          추가
        </button>
      </div>
    </div>
  );
}
