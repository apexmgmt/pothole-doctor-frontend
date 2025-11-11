export interface RolePermissionPayload {
  name: string
  permissions: string[]
}

export interface UpdateRolePermissionPayload {
  id: string
  name: string
  guard_name: string
  permissions: string[]
}
