'use client';

import MarkdownPreview from '@uiw/react-markdown-preview';

interface BlogPreviewProps {
  title: string;
  /** 마크다운 본문 — 실제 블로그(ztlog-web-ui)와 동일한 렌더러로 그려서 저장 결과를 그대로 미리 본다. */
  markdown: string;
}

export default function BlogPreview({ title, markdown }: BlogPreviewProps) {
  return (
    <div>
      <p className="mb-3 text-xs font-medium tracking-wider uppercase text-text-light">
        블로그 미리보기 — 실제 렌더러(@uiw/react-markdown-preview) 사용
      </p>
      <div className="blog-preview">
        <h1 className="blog-preview-title">{title.trim() || '제목 없음'}</h1>
        {markdown.trim() ? (
          <MarkdownPreview source={markdown} wrapperElement={{ 'data-color-mode': 'light' }} />
        ) : (
          <p className="blog-preview-empty">본문을 작성하면 미리보기가 표시됩니다.</p>
        )}
      </div>
    </div>
  );
}
