import { BusinessLocation } from '../business_location.types'
import { ClientSource } from '../client_sources.types'
import { Company } from '../companies.type'
import { InterestLevel } from '../interest_levels.types'
import { ServiceType } from '../service_types.types'
import { Staff } from '../staff.types'

export interface LeadClient {
  id: string
  company_id: string
  company?: Company
  interest_level_id: string
  interest_level?: InterestLevel
  clientable_id: string
  clientable_type: string
  clientable?: LeadClientAble
  added_by: string
  reference_id: string
  reference?: Staff
  first_name: string
  last_name: string
  display_name: string
  type: string
  phone: string
  email: string
  source_id: string
  source?: ClientSource
  lead_cost: string | number
  status: number
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface LeadClientAble {
  id: string
  spouse_name: string
  address: string 
  best_time: string
  spouse_phone: string 
  cell_phone: string
  cc_email: string
  pre_qualifi_amount: number
  is_tax_exempt: number | 0 | 1
  is_quic_book: number | 0 | 1
  created_at: string
  updated_at: string
  deleted_at: string | null
}
export interface Lead {
  id: string
  spouse_name: string | null
  address: string | null
  best_time: string | null
  spouse_phone: string
  cell_phone: string
  cc_email: string | null
  pre_qualifi_amount?: string | number | null
  is_tax_exempt: number
  is_quic_book: number
  created_at: string
  updated_at: string
  deleted_at?: string | null
  client?: LeadClient
}

export interface LeadPayload {
  type: string | 'customer' | 'lead'
  spouse_name: string
  address: string
  best_time: string
  spouse_phone: string
  cell_phone: string
  cc_email: string
  pre_qualifi_amount: number
  is_tax_exempt: number
  is_quic_book: number
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
  service_type_ids: string[]
}

export * from './leads_sms.types'
export * from './leads_notes.types'
export * from './leads_contacts.types'
export * from './leads_emails.types'
