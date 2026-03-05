import { BusinessLocation } from "./business_location"
import { Client } from "./clients/clients"
import { EstimateType } from "./estimate_types"
import { Estimate, TakeoffData } from "./estimates/estimates"
import { Proposal, ProposalService } from "./estimates/proposals"

export interface Invoice {
  id: string
  invoice_number: number
  estimate_id: string | null
  estimate?: Estimate
  proposal_id: string | null
  proposal?: Proposal
  invoice_type_id: string 
  invoice_type?: EstimateType
  client_id: string
  client?: Client
  assign_id: string 
  created_by: string 
  payment_term_id: string
  service_type_id: string
  title: string
  interaction: string | 'cash_and_pickup' | 'cash_and_delivery' | '' | null
  pickup_date: string | null
  pickup_location_id: string | null
  pickup_location?: BusinessLocation | null
  pickup_notes: string | null
  delivery_datetime: string | null
  delivery_location: string | null
  delivery_notes: string | null
  tax_rate: number
  status: string
  issue_date: string | null
  due_date: string | null
  discount: number
  subtotal: number
  sale_tax: number
  total: number
  message: string | null
  reason: string | null
  take_off_data: TakeoffData | null
  deleted_at: string | null
  created_at: string
  updated_at: string
  services?: ProposalService[]
}


