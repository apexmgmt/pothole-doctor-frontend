import { Permission, PermissionsByModule, Role } from './role_permission.types'
import { UserAble } from './user.types'

export interface Staff {
  id: string
  first_name: string
  last_name: string
  email: string
  guard: string
  password?: string
  userable?: UserAble
  created_at: string
  updated_at: string
  permissions?: Permission[]
  roles?: Role[]
}

export interface StaffPayload {
  first_name: string
  last_name: string
  email: string
  user_type: string
  password: string
  password_confirmation: string
  phone?: string
  address?: string
  permissions?: string[]
  roles?: string[]
}

export interface CreateOrEditStaffProps {
  mode: 'create' | 'edit'
  roles: Role[]
  permissions: PermissionsByModule
  staffId?: string
  staffData?: Staff
}
