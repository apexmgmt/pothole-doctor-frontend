import type { Product } from '@/types'

export interface AddedProduct {
  product_id: string
  vendor_id: string
  product: Product
  quantity: number
  company_cost: number
  work_order_cost: number
  margin: number
  customer_price: number
}

export interface FormValues {
  vendor_id: string
  courier_id: string
  reference_number: string
  est_departure_date: Date | null
  est_arrival_date: Date | null
  est_shipping_cost: number | string
  warehouse_type: 'warehouse' | 'location'
  warehouse_id: string
  payment_due: '' | 'on_arrival' | 'paid'
  status: 'new' | 'pending' | 'ordered'
  tax_amount: number | string
  comments: string
}
