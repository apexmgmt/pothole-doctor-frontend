import { ProductCategory } from './product_categories'
import { ServiceType } from './service_types'
import { Unit } from './units'
import { Vendor } from './vendors'

export interface Product {
  id: string
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
  purchase_uom: string
  uom_info: UomInfo
  coverage_per_uom: CoveragePerUom
  product_cost: number
  margin: number
  selling_info: SellingInfo
  minimum_qty: number
  round_up_quantity: number
  type: string | 'inventory' | 'non-inventory'
  is_notify: number | 0 | 1
  visible: number | 0 | 1
  is_freight_percentage: number | 0 | 1
  is_discontinued_product: number | 0 | 1
  comments: string
  status: number | 1 | 0
  created_at: string
  updated_at: string
  deleted_at: string | null
  category?: ProductCategory
  service_types?: ServiceType[]
  vendor?: Vendor
  galleries?: ProductGallery[]
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
  purchase_uom: string
  uom_info: UomInfo
  coverage_per_uom: CoveragePerUom
  product_cost: number
  margin: string
  selling_info: SellingInfo
  minimum_qty: number
  round_up_quantity: number
  type: string | 'inventory' | 'no-inventory'
  is_notify: number | 0 | 1
  visible: number | 0 | 1
  is_freight_percentage: number | 0 | 1
  is_discontinued_product: number | 0 | 1
  comments: string
  status: number | 1 | 0
  sku: string
  galleries?: any[]
}

export interface UomInfo {
  carton_per_pallet: number
  piece_per_carton: number
  lb: number
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
