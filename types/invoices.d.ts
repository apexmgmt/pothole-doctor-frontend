import { BusinessLocation } from './business_location'
import { Client } from './clients/clients'
import { EstimateType } from './estimate_types'
import { Estimate, TakeoffData } from './estimates/estimates'
import { Proposal, ProposalService } from './estimates/proposals'
import { LaborCost } from './labor_costs'
import { Product } from './products'

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
  payment_method?: string
  payment_method_data?: Record<string, string> | null
  is_agreed_terms?: boolean | number | null
  is_signed?: boolean
}

export interface InvoicePayload {
  service_type_id: string
  invoice_type_id: string
  client_id: string
  assign_id: string
  payment_term_id: string
  title: string
  location: string
  due_date: string
  issue_date: string

  // Material Only fields
  interaction?: 'cash_and_pickup' | 'cash_and_delivery' | '' | null
  pickup_date?: string | null
  pickup_location_id?: string | null
  pickup_notes?: string | null
  delivery_datetime?: string | null
  delivery_location?: string | null
  delivery_notes?: string | null
  tax_rate?: number
}

export interface InvoiceServicePayload {
  estimate_id: string
  discount_type: 'percentage' | 'fixed'
  discount: number
  message: string
  services: ServicePayload[]
}

export interface ServicePayload {
  service_type_id: string
  items: InvoiceServiceItemPayload[]
}

export interface InvoiceServiceItemPayload {
  product_id?: string
  product?: Product
  labor_cost_id?: string
  labor_cost?: LaborCost
  name: string
  description: string
  type: 'invoice' | 'product' | 'labor' | 'expense' | 'comment' | 'deduction'
  unit_cost: number
  qty: number
  unit_name: string
  total_cost?: number
  margin: number
  unit_price: number
  discount: number // percentage or fixed amount
  discount_type?: 'percentage' | 'fixed'
  freight_charge?: number
  is_sale: number | 1 | 0
  tax_type?: 'percentage' | 'fixed'
  tax?: number
  tax_amount: number
  total_price?: number
  note: string
}
