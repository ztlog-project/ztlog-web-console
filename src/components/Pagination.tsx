'use client';

import { useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const result: (number | '...')[] = [1];
    if (currentPage > 3) result.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      result.push(i);
    }
    if (currentPage < totalPages - 2) result.push('...');
    result.push(totalPages);
    return result;
  }, [currentPage, totalPages]);

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
        className={`px-3 py-2 text-sm rounded-lg border border-border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2
          ${currentPage === 1 ? 'text-text-light cursor-not-allowed bg-bg' : 'text-text hover:bg-primary hover:text-white hover:border-primary'}`}
      >
        이전
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} aria-hidden="true" className="w-9 h-9 flex items-center justify-center text-sm text-text-light">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goToPage(p)}
            aria-label={`${p}페이지로 이동`}
            aria-current={p === currentPage ? 'page' : undefined}
            className={`w-9 h-9 text-sm rounded-lg border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2
              ${p === currentPage ? 'bg-primary text-white border-primary' : 'border-border text-text hover:bg-primary hover:text-white hover:border-primary'}`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
        className={`px-3 py-2 text-sm rounded-lg border border-border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2
          ${currentPage === totalPages ? 'text-text-light cursor-not-allowed bg-bg' : 'text-text hover:bg-primary hover:text-white hover:border-primary'}`}
      >
        다음
      </button>
    </div>
  );
}
