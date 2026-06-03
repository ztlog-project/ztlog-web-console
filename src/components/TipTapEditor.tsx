'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded text-sm transition-colors
        ${active ? 'bg-primary text-white' : 'text-text-light hover:bg-border hover:text-text'}
        disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-1 self-center" />;
}

export default function TipTapEditor({ value, onChange, disabled = false, placeholder = '내용을 입력하세요...' }: TipTapEditorProps) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: value,
    immediatelyRender: false,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  const openLinkInput = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href ?? '';
    setLinkUrl(prev);
    setShowLinkInput(true);
    setTimeout(() => linkInputRef.current?.focus(), 0);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const cancelLink = useCallback(() => {
    setShowLinkInput(false);
    setLinkUrl('');
  }, []);

  if (!editor) return null;

  const safeHtml = useMemo(
    () => (typeof window !== 'undefined' ? DOMPurify.sanitize(value) : value),
    [value]
  );

  return (
    <div className={`border border-border rounded-lg overflow-hidden bg-white ${disabled ? 'opacity-50' : ''}`}>
      {/* Tab bar */}
      <div className="flex border-b border-border bg-bg">
        <button
          type="button"
          onClick={() => setTab('edit')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
            ${tab === 'edit' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text'}`}
        >
          편집
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
            ${tab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text'}`}
        >
          미리보기
        </button>
      </div>

      {/* Toolbar */}
      <div className={`flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-bg ${tab === 'preview' ? 'hidden' : ''}`}>
        {/* Headings */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="제목 1">H1</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="제목 2">H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="제목 3">H3</ToolbarButton>

        <Divider />

        {/* Inline formatting */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="굵게">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="기울임">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="19" y1="4" x2="10" y2="4" strokeWidth="2" strokeLinecap="round"/><line x1="14" y1="20" x2="5" y2="20" strokeWidth="2" strokeLinecap="round"/><line x1="15" y1="4" x2="9" y2="20" strokeWidth="2" strokeLinecap="round"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="밑줄">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="4" y1="21" x2="20" y2="21" strokeWidth="2" strokeLinecap="round"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="취소선">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round"/><path d="M16 6C16 6 14.5 4 12 4C9.5 4 7 5.5 7 8C7 10.5 9.76 11.47 12 12" strokeWidth="2" strokeLinecap="round"/><path d="M8 18C8 18 9.5 20 12 20C14.5 20 17 18.5 17 16C17 14.58 16.27 13.67 15 13" strokeWidth="2" strokeLinecap="round"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="인라인 코드">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="8 6 2 12 8 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="왼쪽 정렬">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="12" x2="15" y2="12" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="가운데 정렬">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="12" x2="18" y2="12" strokeWidth="2" strokeLinecap="round"/><line x1="4" y1="18" x2="20" y2="18" strokeWidth="2" strokeLinecap="round"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="오른쪽 정렬">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="불릿 목록">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="9" y1="6" x2="20" y2="6" strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="12" x2="20" y2="12" strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="18" x2="20" y2="18" strokeWidth="2" strokeLinecap="round"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="번호 목록">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="10" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round"/><line x1="10" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round"/><line x1="10" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round"/><text x="2" y="8" fontSize="7" fill="currentColor" fontFamily="sans-serif">1.</text><text x="2" y="14" fontSize="7" fill="currentColor" fontFamily="sans-serif">2.</text><text x="2" y="20" fontSize="7" fill="currentColor" fontFamily="sans-serif">3.</text></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="인용구">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="코드 블록">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/><polyline points="9 9 5 12 9 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="15 9 19 12 15 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton onClick={openLinkInput} active={editor.isActive('link')} title="링크">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Undo / Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="실행 취소">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="9 14 4 9 9 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 20v-7a4 4 0 0 0-4-4H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="다시 실행">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="15 14 20 9 15 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 20v-7a4 4 0 0 1 4-4h12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </ToolbarButton>
      </div>

      {/* Link input panel */}
      {showLinkInput && tab === 'edit' && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-bg/50">
          <input
            ref={linkInputRef}
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
              if (e.key === 'Escape') cancelLink();
            }}
            placeholder="https://example.com"
            className="flex-1 px-3 py-1.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <button
            type="button"
            onClick={applyLink}
            className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            적용
          </button>
          <button
            type="button"
            onClick={cancelLink}
            className="px-3 py-1.5 text-sm border border-border text-text-light rounded-lg hover:bg-bg transition-colors"
          >
            취소
          </button>
        </div>
      )}

      {/* Editor Area */}
      <div className={tab === 'preview' ? 'hidden' : ''}>
        <EditorContent
          editor={editor}
          className="tiptap-content min-h-100 px-4 py-3 text-sm text-text focus:outline-none"
        />
      </div>

      {/* Preview Area */}
      {tab === 'preview' && (
        <div className="min-h-100 px-4 py-3 text-sm text-text">
          {value ? (
            <div
              className="tiptap-preview"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          ) : (
            <p className="text-text-light italic">미리볼 내용이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
}
