export type CategoryItem = {
  id: string;
  name: string;
  color: string;
  issueCount: number;
  createdAt: string;
};

export type CategoriesListResponse = {
  success: boolean;
  data: CategoryItem[];
};

export type CategoryResponse = {
  success: boolean;
  message?: string;
  data: CategoryItem;
};

export type CreateCategoryPayload = {
  name: string;
  color: string;
};

export type UpdateCategoryPayload = {
  name?: string;
  color?: string;
};
