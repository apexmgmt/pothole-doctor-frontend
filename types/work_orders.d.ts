import {
  CompletionCertificate,
  Invoice,
  MaterialJobAction,
  Model,
  User,
  BusinessLocation,
  Client,
  EstimateType,
  Estimate,
  TakeoffData,
  Proposal,
  ProposalService,
  LaborCost,
  Product
} from '.'

export interface WorkOrder extends Model {
  work_order_number: number
  invoice_id: string
  invoice?: Invoice
  estimate_id: string | null
  estimate?: Estimate
  proposal_id: string | null
  proposal?: Proposal
  work_order_type_id: string
  work_order_type?: EstimateType
  completion_certificates?: CompletionCertificate[]
  client_id: string
  client?: Client
  assign_id: string
  assign_user?: User
  created_by: string
  location?: BusinessLocation | null
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
  profit: number
  message: string | null
  reason: string | null
  take_off_data: TakeoffData | null
  deleted_at: string | null
  invoice_id: string | null
  services?: ProposalService[]
  payment_method?: string
  payment_method_data?: Record<string, string> | null
  is_agreed_terms?: boolean | number | null
  is_signed?: boolean
  address_id?: string | null
  address?: ClientAddress | null
  location_id?: string | null
}

export interface WorkOrderPayload {
  service_type_id: string
  work_order_type_id: string
  client_id: string
  assign_id: string
  payment_term_id: string
  title: string
  address_id?: string | null
  location_id?: string | null
  issue_date: string
  due_date: string

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

export interface WorkOrderServicePayload {
  estimate_id: string
  discount_type: 'percentage' | 'fixed'
  discount: number
  message: string
  services: ServicePayload[]
}

export interface ServicePayload {
  service_type_id: string
  group_id: string | null
  items: WorkOrderServiceItemPayload[]
}

export interface WorkOrderServiceItemPayload {
  item_id?: string | null
  product_id?: string
  vendor_id?: string
  sku?: string
  color?: string
  style?: string
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
  unit_id?: string
  discount: number // percentage or fixed amount
  discount_type?: 'percentage' | 'fixed'
  freight_charge?: number
  is_sale: number | 1 | 0
  tax_type?: 'percentage' | 'fixed'
  tax?: number
  tax_amount: number
  total_price?: number
  note: string
  material_job_actions?: MaterialJobAction[]
}
