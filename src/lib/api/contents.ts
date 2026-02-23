import { api } from './client';
import { Content, ApiResponse, PaginatedResponse, ContentSearchType } from './types';

export const contentsApi = {
  getList: (page: number = 1): Promise<ApiResponse<PaginatedResponse<Content>>> =>
    api.get('/v1/contents', { page }),

  getDetail: (ctntNo: number): Promise<ApiResponse<Content>> =>
    api.get(`/v1/contents/${ctntNo}`),

  create: (data: Partial<Content>): Promise<ApiResponse<Content>> =>
    api.post('/v1/contents', data),

  update: (data: Partial<Content>): Promise<ApiResponse<Content>> =>
    api.put('/v1/contents', data),

  delete: (ctntNo: number): Promise<ApiResponse<void>> =>
    api.delete(`/v1/contents/${ctntNo}`),

  search: (type: ContentSearchType, param: string, page: number = 1): Promise<ApiResponse<PaginatedResponse<Content>>> =>
    api.get('/v1/contents/search', { type, param, page }),
};
