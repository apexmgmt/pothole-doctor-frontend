import { BusinessLocation, Courier, Model, Product, Unit, User, Vendor, Warehouse } from '.'

export interface PurchaseOrder extends Model {
  purchase_order_active: boolean
  purchase_order_number: number
  vendor_id: string
  vendor?: Vendor
  courier_id: string
  courier?: Courier
  warehouse_type: 'warehouse' | 'location'
  warehouse_id: string
  warehouse?: Warehouse | BusinessLocation
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
  added_by?: User
  type: 'inventory' | 'purchase_order'
  tax_amount: number
  total_weight: number
  comments: string
  purchase_products: PurchaseOrderProduct[]
}

export interface PurchaseOrderProduct extends Model {
  product_id: string
  product?: Product
  vendor_id: string
  vendor?: Vendor
  purchase_order_id: string
  purchase_cost: number
  purchase_cost_unit_id: string
  purchase_cost_unit?: Unit
  coverage_cost: number
  coverage_cost_unit_id: string
  coverage_cost_unit?: Unit
  total_purchase_cost: number
  quantity: number
  comments: string
  coverage_rate: number
  work_order_cost: number
  customer_price_from_product: number
  customer_price: number
  margin: number
  regular_price: number | null
  regular_price_unit_id: string | null
  regular_price_unit?: Unit | null
  pallet_price: number | null
  pallet_price_unit_id: string | null
  pallet_price_unit?: Unit | null
  adjusted_quantity: number
  adjusted_reason: string
  purchase_product_receipts?: PurchaseProductReceipt[]
}

export interface PurchaseProductReceipt extends Model {
  purchase_product_id: string
  received_quantity: number 
  received_date: string
  warehouse_type: 'warehouse' | 'location'
  warehouse_id: string
  warehouse?: Warehouse | BusinessLocation
  stock_area_id: string | null
  stock_section_id: string | null
  dye_lot: string | null
}

export interface InventoryPayload {
  company_cost: number
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

export interface InventoryAdjustment extends Model {
  purchase_order_id: string
  purchase_product_id: string
  previous_quantity: number
  adjustment_quantity: number
  new_quantity: number
  reason: string
  adjusted_by: string | User
}
