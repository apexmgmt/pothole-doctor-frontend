import { BusinessLocation } from '../business_location'
import { ClientSource } from '../client_sources'
import { Company } from '../companies'
import { ContactType } from '../contact_types'
import { InterestLevel } from '../interest_levels'
import { ServiceType } from '../service_types'
import { Staff } from '../staff'
import { User } from '../user'
import { ClientAddress } from './clients_addresses'

export interface Client {
  id: string
  company_id: string | null
  interest_level_id: string
  clientable_id: string
  clientable_type: string
  added_by?: User
  reference_id: string
  first_name: string
  last_name: string
  display_name: string
  type: 'customer' | 'lead'
  phone: string
  email: string
  source_id: string
  lead_cost: number
  status: number | 0 | 1
  created_at: string
  updated_at: string
  deleted_at?: string | null
  contact_type_id: string | null
  location_id: string | null
  company?: Company
  interest_level?: InterestLevel
  clientable?: ClientAble
  contact_type?: ContactType
  reference?: Staff
  location?: BusinessLocation
  address: ClientAddress
  addresses?: ClientAddress[]
  desired_services?: ServiceType[]
  source?: ClientSource
}

export interface ClientAble {
  id: string
  spouse_name: string
  spouse_phone: string
  cell_phone: string
  cc_email: string
  pre_qualified_amount: number
  is_tax_exempt: number | 0 | 1
  is_quick_book: number | 0 | 1
  created_at: string
  updated_at: string
  deleted_at: string | null
  best_time: string | null
}

export interface ClientPayload {
  type: 'lead' | 'customer'
  spouse_name: string
  address?: string
  address_id?: string
  address_title?: string
  address_is_default?: number | 0 | 1
  city_id?: string
  state_id?: string
  country_id?: string
  zip_code?: string
  best_time: string
  spouse_phone: string
  cell_phone: string
  cc_email: string
  pre_qualified_amount: number
  is_tax_exempt: number
  is_quick_book: number
  company_name: string
  interest_level_id: string
  reference_id: string
  first_name: string
  last_name: string
  display_name: string
  phone: string
  email: string
  source_id: string
  lead_cost: number
  status: number | 1 | 0
  location_id: string
  contact_type_id: string
  service_type_ids: string[]
}

export * from './clients_notes'
export * from './clients_contacts'
export * from './clients_emails'
export * from './clients_addresses'
export * from './clients_sms'
