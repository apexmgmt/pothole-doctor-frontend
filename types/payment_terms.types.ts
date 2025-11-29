export interface PaymentTerm {
  id: string
  name: string
  type: string
  status: number | 1 | 0
  due_time: number
  created_at: string
  updated_at: string
}

export interface PaymentTermPayload {
  name: string
  type: string
  status: number | 1 | 0
  due_time: number
}

export interface PaymentTermType {
    id: string
    name: string
    type: string
    created_at: string
    updated_at: string
}
