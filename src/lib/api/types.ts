export interface ApiResponse<T> {
  code: string;
  message?: string;
  data?: T;
}

export interface LoginResponse {
  accessToken: string;
}

export interface UserInfo {
  userId: string;
  username: string;
  grant: string;
  inpDttm: string;
  updDttm: string;
}

export interface Content {
  ctntNo: number;
  title: string;
  subTitle?: string;
  /** 본문 필드 — 백엔드에 따라 body 또는 content로 반환될 수 있음 */
  body?: string;
  content?: string;
  cateNo?: number | null;
  /** 태그 필드 — 백엔드에 따라 tags 또는 tagList로 반환될 수 있음 */
  tags?: { tagNo: number }[];
  tagList?: { tagNo: number }[];
  inpUser?: string;
  inpDttm?: string;
  updDttm?: string;
}

export interface Tag {
  tagNo: number;
  tagName: string;
  sort?: number;
}

export interface DashboardStats {
  totalPosts?: number;
  totalViews?: number;
  totalComments?: number;
  totalTags?: number;
}

export interface PaginatedResponse<T> {
  content?: T[];
  list?: T[];
  totalPages?: number;
  totalElements?: number;
  count?: number;
  totalCount?: number;
  page?: number;
}

export function pageItems<T>(data: PaginatedResponse<T>): T[] {
  return data.content ?? data.list ?? [];
}

export function pageTotalElements<T>(data: PaginatedResponse<T>, fallback: number): number {
  return data.totalElements ?? data.count ?? data.totalCount ?? fallback;
}

export function pageTotalPages<T>(data: PaginatedResponse<T>, itemCount: number): number {
  return (data.totalPages ?? Math.ceil((data.totalElements ?? itemCount) / 10)) || 1;
}

export type ContentSearchType = 'TITLE' | 'CONTENT' | 'TITLE_CONTENT' | 'TAG';

export interface Category {
  cateNo: number;
  cateNm: string;
  cateDepth: number;
  upperCateNo?: number | null;
  dispOrd?: number;
  useYn: 'Y' | 'N';
  categories?: Category[];
}
