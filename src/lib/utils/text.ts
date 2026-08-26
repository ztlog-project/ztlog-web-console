/** 마크다운 본문에서 서식을 걷어낸 짧은 미리보기 텍스트(부제)를 만든다. */
export function markdownToPlainText(markdown: string, maxLen = 100): string {
  return markdown
    .replace(/<[^>]*>/g, ' ') // tiptap-markdown이 표현 불가한 서식(예: <u>)을 raw HTML로 남기는 경우
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}
