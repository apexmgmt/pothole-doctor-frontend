export interface RolePermissionPayload {
  name: string;
  permissions: string[];
}

export interface Permission {
  id: number;
  name: string;
  module?: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
}

export type PermissionsByModule = {
  [module: string]: Permission[];
};
