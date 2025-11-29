import { PaymentTerm } from "./payment_terms.types"

export interface ContactType {
  id: string
  name: string
  payment_term_id: string
  payment_term?: PaymentTerm
  material_down_payment: number
  labor_down_payment: number
  created_at: string
  updated_at: string
}

export interface ContactTypePayload {
  name: string
  payment_term_id: string
  material_down_payment: number
  labor_down_payment: number
}
