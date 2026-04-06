import { Courier, Model, Product, Vendor } from '.'

export interface PurchaseOrder extends Model {
  purchase_order_number: number
  vendor_id: string
  vendor?: Vendor
  courier_id: string
  courier?: Courier
  warehouse_type: 'warehouse' | 'location'
  reference_number: string
  est_departure_date: string
  est_arrival_date: string
  est_shipping_cost: number
  actual_departure_date: string | null
  actual_arrival_date: string | null
  actual_shipping_cost: number | null
  status: 'new' | 'pending' | 'moved_to_inventory' | 'received' | 'partial_received'
  lot_number: string
  added_date: string
  added_by_id: string
  type: 'inventory' | 'purchase_order'
  tax_amount: number
  total_weight: number
  comments: string
}

export interface InventoryPayload {
  product_id: string
  vendor_id: string
  warehouse_type: 'warehouse' | 'location'
  warehouse_id: string | null
  stock_area_id: string | null
  stock_section_id: string | null
  quantity: number
  work_order_cost: number
  margin: number | null
  customer_price: number | null
  regular_price: number | null
  regular_price_unit_id: string | null
  pallet_price: number | null
  pallet_price_unit_id: string | null
  comments: null | string
  dye_lot: null | string
}

export interface InventoryAdjustPayload {
  quantity: number
  reason: string
}
