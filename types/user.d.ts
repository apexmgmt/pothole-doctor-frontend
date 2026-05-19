import { City, CommissionType, Company, Model, Permission, Role, State } from '.'

export interface UserAble extends Model {
  profile_picture: string | null
  address: string | null
  phone: string | null
  commission_type_id?: string
  commission_type?: CommissionType
  deleted_at: string | null
  company_id?: string
  company?: Company
  street_address?: string
  city_id?: string
  city?: City
  state_id?: string
  state?: State
  zip_code?: string
  company_name?: string
}

export interface User extends Model {
  first_name: string
  last_name: string
  email: string
  email_verified_at: string | null
  guard: string
  status: boolean
  user_type: string
  userable?: UserAble
  permissions?: Permission[]
  roles?: Role[]
  [key: string]: any
}
