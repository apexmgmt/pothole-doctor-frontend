import { BusinessLocation } from '../business_location.types'
import { ClientSource } from '../client_sources.types'
import { Company } from '../companies.type'
import { ContactType } from '../contact_types.types'
import { InterestLevel } from '../interest_levels.types'
import { ServiceType } from '../service_types.types'
import { Staff } from '../staff.types'
import { User } from '../user.types'
import { ClientAddress } from './clients_addresses.types'


export interface Client {
  id: string
  company_id: string
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
  type: 'customer' | 'lead'
  spouse_name: string
  address: string
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


export * from './clients_notes.types'
export * from './clients_contacts.types'
export * from './clients_emails.types'
export * from './clients_addresses.types'
export * from './clients_sms.types'
