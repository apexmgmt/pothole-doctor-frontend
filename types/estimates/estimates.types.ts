import { Client } from '../clients/clients.types'
import { EstimateType } from '../estimate_types.types'
import { PaymentTerm } from '../payment_terms.types'
import { ServiceType } from '../service_types.types'
import { Staff } from '../staff.types'

export interface Estimate {
  id: string
  estimate_number: number
  status: string
  title: string
  location: string
  client_id: string
  client?: Client
  estimate_type_id: string
  estimate_type?: EstimateType
  assign_id: string
  assign_user?: Staff
  service_type_id: string
  service_type?: ServiceType
  payment_term_id: string
  payment_term?: PaymentTerm
  expiration_date: string
  biding_date: string
  created_at: string
  updated_at: string
}

export interface EstimatePayload {
  service_type_id: string
  estimate_type_id: string
  client_id: string
  assign_id: string
  payment_term_id: string
  title: string
  location: string
  expiration_date: string
  biding_date: string
}
