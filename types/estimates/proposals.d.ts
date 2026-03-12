import { Client, Estimate, LaborCost, Product, ServiceType, User } from '@/types'
export interface Proposal {
  id: string
  proposal_number: number
  estimate_id: string
  discount: number
  subtotal: number
  sale_tax: number
  total: number
  is_down_payment_materials: boolean
  down_payment_amount: number
  down_payment_percentage: number
  message: string | null
  created_at: string
  updated_at: string
  discount_type: 'percentage' | 'fixed'
  estimate?: Estimate
  services?: ProposalService[]
  status:
    | string
    | 'new'
    | 'sent to customer'
    | 'viewed by customer'
    | 'converted to invoice'
    | 'reviewed by customer'
    | 'void proposal'
    | 'dead proposal'
    | 'reopened'
  reason?: string | null
}

export interface ProposalHistory {
  id: string
  proposal_id: string
  p_id: string
  qc_id: string
  client_id: string
  sent_by: string
  sent_by_user?: User
  client?: Client
  email_to: string
  subject: string
  message: string
  proposal_data: Proposal
  subtotal: number
  sale_tax: number
  total: number
  sent_at: string
  viewed_at: string | null
  review: string | null
  created_at: string
  updated_at: string
}

export interface ProposalService {
  id: string
  proposal_id: string
  proposal_estimate_id: string
  service_type_id: string
  material_cost: number
  material_tax: number
  labor_cost: number
  freight_cost: number
  freight_charge: number
  expense_cost: number
  sale_tax: number
  total_sale: number
  material_sale: number
  labor_sale: number
  profit: number
  created_at: string
  updated_at: string
  items: ProposalServiceItem[]
  service_type?: ServiceType
}

export interface ProposalServiceItem {
  product_id?: string
  product?: Product
  labor_cost_id?: string
  labor_cost?: LaborCost
  id: string
  proposal_service_id: string
  service_type_id: string
  name: string
  description: string
  type: 'invoice' | 'product' | 'labor' | 'expense' | 'comment' | 'deduction'
  unit_cost: number
  qty: number
  total_cost: number
  margin: number
  unit_price: number
  unit_name: string | null
  total_price: number
  discount: number
  tax: number
  discount_type: 'percentage' | 'fixed'
  tax_type: 'percentage' | 'fixed'
  note: string | null
  is_sale: number | 1 | 0
  created_at: string
  updated_at: string
  tax_amount: number
  freight_charge: number
}
export interface ProposalPayload {
  estimate_id: string
  discount_type: 'percentage' | 'fixed'
  discount: number
  message: string
  is_down_payment_materials?: boolean
  down_payment_amount?: number
  down_payment_percentage?: number
  services: ProposalServicePayload[]
}

export interface ProposalServicePayload {
  service_type_id: string
  items: ProposalServiceItemPayload[]
}

export interface ProposalServiceItemPayload {
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
