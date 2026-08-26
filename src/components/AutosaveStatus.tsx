'use client';

import { useEffect, useState } from 'react';

function formatRelative(savedAt: number, now: number): string {
  const diffSec = Math.max(0, Math.floor((now - savedAt) / 1000));
  if (diffSec < 5) return '방금 자동 저장됨';
  if (diffSec < 60) return `${diffSec}초 전 자동 저장됨`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전 자동 저장됨`;
  return new Date(savedAt).toLocaleString('ko-KR', {
    month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }) + ' 자동 저장됨';
}

export default function AutosaveStatus({ lastSavedAt }: { lastSavedAt: number | null }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!lastSavedAt) return;
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, [lastSavedAt]);

  if (!lastSavedAt) return null;

  return (
    <p role="status" aria-live="polite" className="text-xs text-text-light whitespace-nowrap">
      {formatRelative(lastSavedAt, now)}
    </p>
  );
}
