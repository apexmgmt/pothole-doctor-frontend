import { City, State } from "./location.types"
import { PaymentTerm } from "./payment_terms.types"

export interface Vendor {
  id: string
  userable_id: string
  userable_type: string
  first_name: string
  last_name: string
  guard: string | 'vendor'
  status: boolean 
  email: string
  email_verified_at: string | null
  deleted_at: string | null
  tenant_id: string | null
  user_type: string | null
  userable: VendorUserAble
  created_at: string
  updated_at: string
}

export interface VendorUserAble {
    id: string
    payment_term_id: string
    state_id: string
    city_id: string
    zip_code: string
    street_address: string
    tax_type: string
    fax_number: string
    website: string
    note: string
    is_enable_b2b: number | 1 | 0
    b2b_host_url: string
    b2b_port_number: string
    b2b_vendor_id: string
    b2b_username: string
    b2b_password: string
    profit_margin: number
    created_at: string
    updated_at: string
    deleted_at: string | null
    payment_term?: PaymentTerm
    city?: City
    state?: State
}

export interface VendorPayload {
  payment_term_id: string
  phone: string
  number: string
  first_name: string
  last_name: string
  email: string
  password: string
  address: string
  tax_type: string
  fax_number: string
  website: string
  note: string
  is_enable_b2b: number | 1 | 0
  b2b_host_url: string
  b2b_port_number: string
  b2b_vendor_id: string
  b2b_username: string
  b2b_password: string
  profit_margin: number
  city_id: string
  state_id: string
  zip_code: string
  street_address: string
}
