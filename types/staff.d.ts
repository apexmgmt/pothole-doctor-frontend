import { Permission, PermissionsByModule, Role } from './role_permission'
import { UserAble } from './user'

export interface Staff {
  id: string
  first_name: string
  last_name: string
  email: string
  guard: string
  password?: string
  userable_id?: string
  userable_type?: string
  userable?: UserAble
  created_at: string
  updated_at: string
  permissions?: Permission[]
  roles?: Role[]
  status?: boolean
  email_verified_at?: string | null
  deleted_at?: string | null
  user_type?: string
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
