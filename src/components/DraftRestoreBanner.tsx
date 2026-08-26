'use client';

function formatSavedAt(savedAt: number): string {
  return new Date(savedAt).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface DraftRestoreBannerProps {
  savedAt: number;
  onRestore: () => void;
  onDiscard: () => void;
}

export default function DraftRestoreBanner({ savedAt, onRestore, onDiscard }: DraftRestoreBannerProps) {
  return (
    <div
      role="status"
      className="mb-6 flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-text">
        <strong className="font-medium">{formatSavedAt(savedAt)}</strong>에 자동 저장된 이전 작성 내용이 있습니다. 이어서 작성하시겠습니까?
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onRestore}
          className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          복구하기
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="px-3 py-1.5 text-sm border border-border text-text-light rounded-lg hover:bg-bg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
