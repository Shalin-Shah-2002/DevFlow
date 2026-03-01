export type LabelItem = {
  id: string;
  githubId: number | null;
  name: string;
  color: string;
  description: string | null;
  repositoryId: string;
  createdAt: string;
  issueCount: number;
  repository?: {
    id: string;
    name: string;
    fullName: string;
  };
};

export type LabelsListResponse = {
  success: boolean;
  labels: LabelItem[];
  total: number;
  page?: number;
  pageSize?: number;
};

export type LabelResponse = {
  success: boolean;
  label: LabelItem;
};

export type LabelSyncResponse = {
  success: boolean;
  message: string;
  synced: number;
  created: number;
  updated: number;
  labels: LabelItem[];
};

export type LabelsQuery = {
  repositoryId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'createdAt' | 'issueCount';
  sortOrder?: 'asc' | 'desc';
};

export type CreateLabelPayload = {
  name: string;
  color: string;
  description?: string;
  repositoryId: string;
};

export type UpdateLabelPayload = {
  name?: string;
  color?: string;
  description?: string;
};
