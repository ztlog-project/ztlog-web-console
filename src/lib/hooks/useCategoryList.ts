'use client';

import { useEffect, useState } from 'react';
import { categoriesApi } from '@/lib/api/categories';
import { Category } from '@/lib/api/types';

export function useCategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    categoriesApi.getList()
      .then(res => {
        const data = (res as any)?.data;
        const list = data?.list ?? data?.content ?? data ?? [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(e => {
        setError(e instanceof Error ? e.message : '카테고리 로딩 실패');
      });
  }, []);

  return { categories, error };
}