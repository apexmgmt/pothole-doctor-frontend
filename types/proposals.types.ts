export interface Proposal {
  id: string
}

export interface ProposalPayload {
  estimate_id: string
  discount_type: 'percentage' | 'fixed'
  discount: number
  message: string
  services: ProposalServicePayload[]
}

export interface ProposalServicePayload {
  service_type_id: string
  items: ProposalServiceItemPayload[]
}

export interface ProposalServiceItemPayload {
  name: string
  description: string
  type: 'invoice' | 'product' | 'labor-cost' | 'expense' | 'comment' | 'deduction'
  unit_cost: number
  qty: number
  unit_name: string
  total_cost?: number
  margin: number
  unit_price: number
  discount: number // percentage
  freight_cost?: number
  is_sale: number | 1 | 0
  tax_amount: number
  total_price?: number
  note: string
}
