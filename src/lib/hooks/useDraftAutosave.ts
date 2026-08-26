'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface PostDraft {
  title: string;
  subTitle: string;
  body: string;
  cateNo: number | null;
  tagNos: number[];
  savedAt: number;
}

const DEBOUNCE_MS = 3000;

function isMeaningful(title: string, body: string): boolean {
  const trimmedBody = body.trim();
  return title.trim() !== '' || (trimmedBody !== '' && trimmedBody !== '<p></p>');
}

/**
 * 게시물 작성/수정 중 내용을 브라우저 localStorage에 자동 임시저장한다.
 * 세션 만료로 강제 로그아웃되거나 탭이 실수로 닫혀도 마지막 입력 내용을 복구할 수 있게 한다.
 */
export function useDraftAutosave(storageKey: string) {
  const [pendingDraft, setPendingDraft] = useState<PostDraft | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setPendingDraft(JSON.parse(raw));
    } catch {
      // 손상된 데이터나 접근 불가 환경(프라이빗 모드 등)은 조용히 무시
    }
  }, [storageKey]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const saveDraft = useCallback((draft: Omit<PostDraft, 'savedAt'>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        if (!isMeaningful(draft.title, draft.body)) return;
        const savedAt = Date.now();
        localStorage.setItem(storageKey, JSON.stringify({ ...draft, savedAt }));
        setLastSavedAt(savedAt);
      } catch {
        // localStorage 용량 초과 등은 조용히 무시 — 임시저장은 부가 기능이지 필수 경로가 아님
      }
    }, DEBOUNCE_MS);
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setPendingDraft(null);
    setLastSavedAt(null);
  }, [storageKey]);

  const dismissDraft = useCallback(() => {
    setPendingDraft(null);
  }, []);

  return { pendingDraft, lastSavedAt, saveDraft, clearDraft, dismissDraft };
}

export function hasUnsavedContent(title: string, body: string): boolean {
  return isMeaningful(title, body);
}
