import { Permission, Role } from './role_permission.types'

export interface UserAble {
  id: string
  profile_picture: string | null
  address: string | null
  phone: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id?: string
  email?: string
  name?: string
  first_name?: string
  last_name?: string
  phone?: string
  address?: string
  profile_picture?: string
  userable?: UserAble
  created_at?: string
  updated_at?: string
  permissions?: Permission[]
  roles?: Role[]
  [key: string]: any
}
