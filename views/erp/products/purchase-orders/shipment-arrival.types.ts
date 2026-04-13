export interface IncorrectFlags {
  departure: boolean
  arrival: boolean
  shipping: boolean
}

export interface ReceiptRowState {
  id: string | null
  received_quantity: number
  received_date: Date | null
  warehouse_type: 'warehouse' | 'location'
  warehouse_id: string
  stock_area_id: string
  stock_section_id: string
  dye_lot: string
  is_moved_to_inventory: boolean
}

export interface ProductRowState {
  id: string
  product_name: string
  ordered_quantity: number
  coverage_per_rate: number | null
  coverage_unit_name: string
  company_cost: number
  work_order_cost: number
  customer_price: number
  margin: number
  product_selling_price: number
  purchase_unit_name: string
  selling_unit_name: string
  default_warehouse_type: 'warehouse' | 'location'
  default_warehouse_id: string
  receipts: ReceiptRowState[]
}

export interface ShipmentFormState {
  actual_departure_date: Date | null
  actual_arrival_date: Date | null
  actual_shipping_cost: string
  comments: string
  tax_amount: string
  other_costs: string
}
