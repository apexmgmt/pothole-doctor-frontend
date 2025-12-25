import { BusinessLocation } from './business_location.types'
import { Company } from './companies.type'
import { City, CountryWithStates, State } from './location.types'
import { PartnerType } from './partner_types.types'
import { Skill } from './skills.types'
import { User } from './user.types'

export interface PartnersProps {
  businessLocations: BusinessLocation[]
  partnerTypes: PartnerType[]
  countriesWithStatesAndCities: CountryWithStates[]
  companies: Company[]
  skills: Skill[]
}

export interface CreateOrEditPartnerModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  partnerId?: string
  partnerDetails?: Partner
  onSuccess?: () => void
  businessLocations: BusinessLocation[]
  partnerTypes: PartnerType[]
  countriesWithStatesAndCities: CountryWithStates[]
  companies: Company[]
  skills: Skill[]
}

// export interface Partner {
//   id: string
//   company_id: string
//   company?: Company
//   partner_type_id: string
//   partner_type?: PartnerType
//   phone: string
//   schedule_color: string
//   fax: string
//   ein: string
//   ssn: string
//   notes: string
//   insurance_expiration: string | number | null
//   w9_expiration: string | number | null
//   hold_amount: number
//   hold_amount_percent: number
//   street_address: string | number
//   city_id: string
//   state_id: string
//   zip_code: string | number
//   in_house_contractor: number | 1 | 0
//   entity: string
//   is_email_confirmation: number | 1 | 0
//   created_at: string
//   updated_at: string
//   deleted_at: string | null
//   skills: PartnerSkill[]
//   locations: BusinessLocation[]
//   city: City
//   state: State
//   user: User
// }

export interface Partner {
  id: string
  userable_id: string
  userable_type: string
  first_name: string
  last_name: string
  guard: string
  status: boolean
  email: string
  email_verified_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
  tenant_id: string | null
  user_type: string
  userable: PartnerUserAble
}

export interface PartnerUserAble {
  id: string
  company_id: string
  partner_type_id: string
  partner_type?: PartnerType
  phone: string
  schedule_color: string
  fax: string
  ein: string
  ssn: string
  notes: string
  insurance_expiration: string | number | null
  w9_expiration: string | number | null
  hold_amount: number
  hold_amount_percent: number
  street_address: string | number
  city_id: string
  city: City
  state_id: string
  state: State
  skills: PartnerSkill[]
  locations: BusinessLocation[]
  company: Company
  zip_code: string | number
  in_house_contractor: number | 1 | 0
  entity: string
  is_email_confirmation: number | 1 | 0
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PartnerPayload {
  first_name: string
  last_name?: string
  email: string
  phone: string
  company_name: string | undefined
  status: number | 1 | 0
  entity: string | 'individual' | 'business'
  ssn: string
  ein: string
  fax: string
  notes: string
  schedule_color: string
  skills: string[]
  insurance_expiration?: string | number | null
  w9_expiration?: string | number | null
  hold_amount: number
  hold_amount_percent: number
  street_address: string | number
  zip_code: string | number
  in_house_contractor: number | 1 | 0
  is_email_confirmation: number | 1 | 0
  location_id: string[]
  partner_type_id: string
  city_id: string
  state_id: string
  user_type: string
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
