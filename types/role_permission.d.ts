export interface RolePermissionPayload {
  name: string
  permissions: string[]
}

export interface Permission {
  id: number
  name: string
  module?: string
  guard_name?: string
  created_at?: string
  updated_at?: string
  pivot?: {
    role_id: number
    permission_id: number
  }
}

export type PermissionsByModule = {
  [module: string]: Permission[]
}

export interface Role {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
  permissions: Permission[]
}
