import { City, CountryWithStates, State } from './location'
import { PaymentTerm } from './payment_terms'
import { TaxType } from './tax_types'

export interface VendorsProps {
  taxTypes: TaxType[]
  countriesWithStatesAndCities: CountryWithStates[]
  paymentTerms: PaymentTerm[]
}

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
  phone: string
  number: string
  state_id: string
  city_id: string
  zip_code: string
  street_address: string
  tax_type: string
  fax_number: string
  website: string
  note: string
  is_enable_b2b: number | 1 | 0
  b2b_host_url: string | null
  b2b_port_number: string | null
  b2b_vendor_id: string | null
  b2b_username: string | null
  b2b_password: string | null
  b2b_vendor_folder?: string
  profit_margin: number | string
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

export interface CreateOrEditVendorModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentTerms: PaymentTerm[]
  taxTypes: TaxType[]
  countriesWithStatesAndCities: CountryWithStates[]
  vendorId?: string
  vendorDetails?: Vendor
  onSuccess?: () => void
}

export interface VendorRebateCredit {
  id: string
  vendor_id: string
  reference: string
  amount: number
  date: string
  note: string
  created_at: string
  updated_at: string
  vendor?: Vendor
}

export interface VendorRebateCreditPayload {
  vendor_id: string
  amount: number
  date: string
  reference: string
  note: string
}

export interface VendorPickupAddress {
  id: string
  addressable_id: string
  addressable_type: string
  title: string
  street_address: string
  state_id: string
  city_id: string
  email: string | null
  phone: string | null
  is_default: number | 1 | 0 | null
  zip_code: string
  created_at: string
  updated_at: string
  addressable?: Vendor
  city?: City
  state?: State
}

export interface VendorPickupAddressPayload {
  title: string
  street_address: string
  state_id: string
  city_id: string
  zip_code: string
  vendor_id?: string
}

export interface VendorSalesman {
  id: string
  vendor_id: string
  name: string
  email: string
  phone: string
  ext: string
  comment: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  vendor?: Vendor
}

export interface VendorSalesmanPayload {
  vendor_id: string
  name: string
  email: string
  comment: string
  ext: string
  phone: string
}
