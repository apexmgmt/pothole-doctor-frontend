import { Model } from '.'
import { ProductCategory } from './product_categories'
import { ServiceType } from './service_types'
import { Unit } from './units'
import { Vendor } from './vendors'

export interface Product extends Model {
  category_id: string
  vendor_id: string
  name: string
  slug: string
  sku: string
  is_rolled_good: string
  vendor_product_name: string
  vendor_style: string
  vendor_color: string
  private_product_name: string
  private_style: string
  private_color: string
  collection: string
  dropped_date: string
  description: string
  purchase_uom_id: string
  unit_per_pallet: number
  piece_per_uom: number
  weight_per_uom: number
  coverage_per_unit_id: string
  coverage_per_rate: number
  purchase_to_selling_conversion_rate: number
  selling_unit_id: string
  selling_price: number
  product_cost: number
  margin: number
  freight_amount?: number
  minimum_qty: number
  round_up_quantity: number
  type: string | 'inventory' | 'non_inventory'
  is_notify: number | 0 | 1
  visible: number | 0 | 1
  is_freight_percentage: number | 0 | 1
  is_discontinued_product: number | 0 | 1
  comments: string
  status: number | 1 | 0
  deleted_at: string | null

  // Stock & Quantities
  remaining_stock: number | null
  on_hand_stock: number | null
  allocated_stock: number | null
  prepared_stock: number | null
  available_stock: number | null
  picked_up_stock: number | null
  required_stock: number | null
  shortage_stock: number | null
  work_order_cost: number | null
  work_order_cost_id: string | null
  location_notes: string | null
  category?: ProductCategory
  service_types?: ServiceType[]
  vendor?: Vendor
  galleries?: ProductGallery[]
  purchase_uom?: Unit
  purchase_unit?: Unit
  selling_uom?: Unit
  selling_unit?: Unit
  coverage_uom?: Unit
  coverage_unit?: Unit
}

export interface SellingInfo {
  value: number
  unit: Unit
}

export interface CoveragePerUom {
  value: number
  unit: Unit
}
export interface ProductPayload {
  name: string
  vendor_id: string
  category_id: string
  service_type_id: string[]
  is_rolled_good: number | 0 | 1
  vendor_product_name: string
  vendor_style: string
  vendor_color: string
  private_product_name: string
  private_style: string
  private_color: string
  collection: string
  dropped_date: string
  description: string
  purchase_uom_id: string
  unit_per_pallet: number
  piece_per_uom: number
  weight_per_uom: number
  coverage_per_unit_id: string
  coverage_per_rate: number
  purchase_to_selling_conversion_rate: number
  selling_unit_id: string
  selling_price: number
  product_cost: number
  margin: string
  minimum_qty: number
  round_up_quantity: number
  type: string | 'inventory' | 'non_inventory'
  is_notify: number | 0 | 1
  visible: number | 0 | 1
  is_freight_percentage: number | 0 | 1
  is_discontinued_product: number | 0 | 1
  freight_amount?: number
  comments: string
  status: number | 1 | 0
  sku: string
  galleries?: any[]
}

export interface UomInfo {
  unit_per_pallet: number
  piece_per_uom: number
  weight_per_uom: number
}

export interface ProductsProps {
  productCategories: ProductCategory[]
  uomUnits: Unit[]
  vendors: Vendor[]
  serviceTypes: ServiceType[]
  isFromModal?: boolean
  selectedRows?: Product[]
  setSelectedRows?: React.Dispatch<React.SetStateAction<Product[]>>
}

export interface ProductGallery {
  id: string
  name: string
  full_path: string
  product_id: string
  created_at: string
  updated_at: string
}
