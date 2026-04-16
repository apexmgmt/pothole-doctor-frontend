import {
  BusinessLocation,
  Client,
  EstimateType,
  Estimate,
  TakeoffData,
  Proposal,
  ProposalService,
  LaborCost,
  Product,
  User,
  Model
} from '.'

export interface Invoice extends Model {
  inid: string
  icid: string
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
  location: string | null
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
  services?: ProposalService[]
  payment_method?: string
  payment_method_data?: Record<string, string> | null
  is_agreed_terms?: boolean | number | null
  is_signed?: boolean
  is_down_payment_materials: boolean
  down_payment_amount: number
  down_payment_percentage: number
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
  group_id: string | null
  items: InvoiceServiceItemPayload[]
}

export interface InvoiceServiceItemPayload {
  item_id?: string | null
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
  unit_id?: string
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

export interface InvoiceJobImage extends Model {
  imageable_id: string
  imageable_type: string
  type: 'before' | 'after'
  full_path: string
  name: string
  uploaded_by: User | null
}

export interface InvoiceJobImagePayload {
  invoice_id: string
  image: File
  type: 'before' | 'after'
}

export interface InvoiceHistory extends Model {
  invoice_id: string
  client_id: string
  sent_by: string
  email_to: string
  subject: string
  message: string
  invoice_data: Invoice
  subtotal: number
  sale_tax: number
  total: number 
  type: 'created_from_proposal' | 'email_sent'
  sent_at: string
  viewed_at: string | null
}
