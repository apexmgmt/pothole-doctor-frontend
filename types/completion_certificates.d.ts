import { Model } from '.'

export interface CompletionCertificate extends Model {
  is_completed: boolean
  work_order_id: string
  service_group_id: string
  service_type_id: string
  service_type_name: string
  signature: string
  is_customer_satisfied: boolean
  customer_installation_scale_rate: number | null
  payment_method: 'ACH' | 'Card' | 'None' | 'Check' | 'Cash' | string
  payment_method_data: Record<string, any> | null
  amount_to_charge: number | null 
  st_id?: string
  sg_id?: string
  wo_id?: string
}

export interface CompletionCertificatePayload {
  wo_id: string
  st_id: string
  sg_id: string
  is_customer_satisfied: boolean
  customer_installation_scale_rate: number | null
  payment_method: 'ACH' | 'Card' | 'None' | 'Check' | 'Cash' | string
  payment_method_data: Record<string, any> | null
  amount_to_charge: number | null
  signature: string // base64-encoded string of the signature image
}
