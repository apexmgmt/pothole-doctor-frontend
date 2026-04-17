import { Client, Company, Model, Product, ServiceType, Staff, Unit, Vendor, Warehouse, WorkOrder } from '..'

export interface MaterialJob extends Model {
  job_type: 'inventory' | 'non_inventory'
  status:
    | 'new'
    | 'allocated'
    | 'partially_prepared'
    | 'prepared'
    | 'pending'
    | 'received'
    | 'partially_received'
    | 'shipped'
    | 'shipped_from_vendor'
  order_status: 'new'
  ordered
  back_ordered
  pending
  cancelled
  completed
  work_order_id: string
  work_order?: WorkOrder
  order_number: string
  service_type_id: string
  service_type?: ServiceType
  sale_representative_id: string
  sale_representative?: Staff
  company_id: string
  company?: Company
  vendor_id: string
  vendor?: Vendor
  product_id: string
  product?: Product
  client_id: string
  client?: Client
  shipped_date: string
  available_date: string
  scheduled_date: string
  quantity: number
  received_quantity: number
  remaining_quantity: number
  picked_up_quantity: number
  allocated_quantity: number
  on_hand_quantity: number
  prepared_quantity: number
  total_material_cost: number
  estimate_received_date: string
  actual_received_date: string
  actions?: MaterialJobAction[]
}

export interface MaterialJobAction extends Model {
  material_job_id: string
  work_order_id: string
  service_group_id: string
  service_item_id: string
  product_id: string
  action_status: string
  action_date: string
  employee_id: string
  employee?: Staff
  vendor_id: string
  product_type: 'inventory' | 'non_inventory'
  quantity: number
  selling_quantity: number
  quantity_unit_id: string
  quantity_unit?: Unit
  sale_unit_id: string
  sale_unit?: Unit
  coverage_rate: number
  coverage_unit_id: string
  coverage_unit?: Unit
  max_quantity: number
  warehouse_type: 'warehouse' | 'location'
  warehouse_id: string
  warehouse?: Warehouse | BusinessLocation | null
  stock_area: string | null
  stock_section: string | null
  location_notes: string | null
}

export interface MaterialJobActionPayload {
  action_status: string
  quantity: number
  action_date: string
  employee_id: string
  vendor_id: string
  warehouse_type: 'warehouse' | 'location'
  warehouse_id: string
  stock_area?: string
  stock_section?: string
  location_notes?: string
}
