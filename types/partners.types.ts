import { BusinessLocation } from './business_location.types'
import { Company } from './companies.type'
import { City, State } from './location.types'
import { PartnerType } from './partner_types.types'
import { User } from './user.types'

export interface Partner {
  id: string
  company_id: string
  company?: Company
  partner_type_id: string
  partner_type?: PartnerType
  phone: string
  schedule_color: string
  fax: string
  ein: string
  ssn: string
  notes: string
  insurance_expiration: string | null
  w9_expiration: string | null
  hold_amount: number
  hold_amount_percent: number
  street_address: string
  city_id: string
  state_id: string
  zip_code: string
  in_house_contractor: number | 1 | 0
  entity: string
  is_email_confirmation: number | 1 | 0
  created_at: string
  updated_at: string
  deleted_at: string | null
  skills: PartnerSkill[]
  locations: BusinessLocation[]
  city: City
  state: State
  user: User
}

export interface PartnerPayload {
  first_name: string
  last_name: string
  email: string
  phone: string
  company_name: string
  location_id: string[]
  status: number | 1 | 0
  entity: string
  ssn: string
  ein: string
  fax: string
  notes: string
  partner_type_id: string
  skills: string[]
  schedule_color: string
  insurance_expiration?: string | null
  w9_expiration?: string | null
  hold_amount: number
  hold_amount_percent: number
  zip_code: string
  in_house_contractor: number | 1 | 0
  is_email_confirmation: number | 1 | 0
  city_id: string
  state_id: string
  role: string
  password: string
}

export interface PartnerSkill {
  id: string
  name: string
  created_at: string
  updated_at: string
  pivot: PartnerSkillPivot
}

export interface PartnerSkillPivot {
  partner_details_id: string
  skill_id: string
}
