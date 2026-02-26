'use client';

import { useEffect, useState, FormEvent } from 'react';
import { tagsApi } from '@/lib/api/tags';
import { Tag } from '@/lib/api/types';

export default function CategoriesPage() {
  const [tagList, setTagList] = useState<Tag[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadTags() {
    setLoading(true);
    setError('');
    try {
      const res = await tagsApi.getList(1);
      if (res.data) {
        const data = res.data as any;
        setTagList(data.list || data.content || []);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTags();
  }, []);

  async function addTag(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await tagsApi.create({ tagName: newName.trim() });
      setNewName('');
      await loadTags();
    } catch (e: any) {
      alert('태그 추가 실패: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(tag: Tag) {
    setEditingId(tag.tagNo);
    setEditName(tag.tagName);
  }

  async function saveEdit(tagNo: number) {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await tagsApi.update({ tagNo, tagName: editName.trim() });
      setEditingId(null);
      await loadTags();
    } catch (e: any) {
      alert('태그 수정 실패: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function deleteTag(tagNo: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await tagsApi.delete(tagNo);
      await loadTags();
    } catch (e: any) {
      alert('태그 삭제 실패: ' + e.message);
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">태그 관리</h1>
        <p className="mt-1 text-sm text-text-light">블로그 태그를 추가, 수정, 삭제합니다</p>
      </div>

      {/* Add Tag */}
      <div className="p-6 mb-6 border rounded-lg shadow-sm bg-card border-border">
        <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text">새 태그 추가</h2>
        <form onSubmit={addTag} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="태그 이름 (최대 15자)"
            maxLength={15}
            required
            disabled={saving}
            className="px-4 py-2.5 border border-border rounded-lg text-sm text-text bg-white flex-1
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors
              disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium
              hover:bg-primary-hover transition-colors flex-shrink-0 inline-flex items-center gap-2
              disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            추가
          </button>
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
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-border">
                  <th className="w-16 px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-light">
                    no
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-light">
                    이름
                  </th>
                  <th className="w-32 px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-light">
                    게시물 수
                  </th>
                  <th className="w-40 px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-light">
                    생성일
                  </th>
                  <th className="w-28 px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-light">
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody>
                {tagList.map((tag, i) => (
                  <tr key={tag.tagNo} className="transition-colors border-b border-border last:border-b-0 hover:bg-bg/50">
                    <td className="px-6 py-3.5 text-sm text-text-light">{i + 1}</td>
                    <td className="px-6 py-3.5">
                      {editingId === tag.tagNo ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); saveEdit(tag.tagNo); }
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          maxLength={15}
                          autoFocus
                          className="px-3 py-1.5 border border-primary rounded text-sm text-text bg-white w-full
                            focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      ) : (
                        <span
                          className="inline-block px-3 py-1.5 border border-transparent text-sm font-medium text-text cursor-pointer hover:text-primary transition-colors"
                          onClick={() => startEdit(tag)}
                        >
                          {tag.tagName}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {(tag as any).tagCount ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-text-light">
                      {(tag as any).inpDttm ? new Date((tag as any).inpDttm).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-6 py-3.5">
                      {editingId === tag.tagNo ? (
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 text-text-light hover:text-text transition-colors rounded-lg hover:bg-bg"
                          title="취소"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => deleteTag(tag.tagNo)}
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
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tagList.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-text-light">등록된 태그가 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
