import { City, CommissionType, Company, Permission, Role, State } from '.'

export interface UserAble {
  id: string
  profile_picture: string | null
  address: string | null
  phone: string | null
  commission_type_id?: string
  commission_type?: CommissionType
  deleted_at: string | null
  created_at: string
  updated_at: string
  company_id?: string
  company?: Company
  street_address?: string
  city_id?: string
  city?: City
  state_id?: string
  state?: State
  zip_code?: string
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
