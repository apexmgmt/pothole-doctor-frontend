import { Model, User } from '.'

export interface Organization extends User {
  domain: Domain
}

export interface Domain extends Model {
  id: number
  domain: string
  is_subdomain: boolean
  tenant_id: string
}

export interface OrganizationCreatePayload {
  first_name: string
  last_name: string
  email: string
  phone: string
  user_type: 'organization'
  password: string
  password_confirmation: string
  subdomain: string
  address: string
  company_name: string
}

export interface OrganizationEditPayload {
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  company_name: string
}
