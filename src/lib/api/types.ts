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
  content?: string;
  inpUser?: string;
  inpDttm?: string;
  updDttm?: string;
}

export interface Tag {
  tagNo: number;
  tagName: string;
}

export interface DashboardStats {
  totalPosts?: number;
  totalViews?: number;
  totalComments?: number;
  totalTags?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  page: number;
}

export type ContentSearchType = 'TITLE' | 'CONTENT' | 'TITLE_CONTENT' | 'TAG';
