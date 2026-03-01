import type {
  CategoriesListResponse,
  CategoryItem,
  CategoryResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload
} from '../models/categories.model';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3001/api';

const toLocalDate = (value?: string): string => {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleString();
};

const normalizeCategory = (category: CategoryItem): CategoryItem => ({
  ...category,
  createdAt: toLocalDate(category.createdAt)
});

const apiRequest = async <T>(
  token: string,
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: unknown
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  const payload = (await response.json().catch(() => null)) as (T & {
    success?: boolean;
    error?: string;
    message?: string;
  }) | null;

  if (!response.ok) {
    const reason = payload?.error || payload?.message || `Request failed (${response.status})`;
    throw new Error(reason);
  }

  if (!payload) {
    throw new Error('Empty API response');
  }

  return payload;
};

export const getCategories = async (token: string): Promise<CategoryItem[]> => {
  const response = await apiRequest<CategoriesListResponse>(token, '/categories', 'GET');
  return (response.data || []).map(normalizeCategory);
};

export const createCategory = async (token: string, payload: CreateCategoryPayload): Promise<CategoryItem> => {
  const response = await apiRequest<CategoryResponse>(token, '/categories', 'POST', payload);
  return normalizeCategory(response.data);
};

export const updateCategory = async (
  token: string,
  categoryId: string,
  payload: UpdateCategoryPayload
): Promise<CategoryItem> => {
  const response = await apiRequest<CategoryResponse>(token, `/categories/${categoryId}`, 'PATCH', payload);
  return normalizeCategory(response.data);
};

export const deleteCategory = async (token: string, categoryId: string): Promise<void> => {
  await apiRequest<{ success: boolean; message: string }>(token, `/categories/${categoryId}`, 'DELETE');
};
