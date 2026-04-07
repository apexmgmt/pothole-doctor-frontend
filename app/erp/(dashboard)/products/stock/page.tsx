import BusinessLocationService from '@/services/api/locations/business_location.service'
import ProductCategoryService from '@/services/api/products/product_categories.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import UnitService from '@/services/api/settings/units.service'
import VendorService from '@/services/api/vendors/vendors.service'
import WarehouseService from '@/services/api/warehouses.service'
import { BusinessLocation, ProductCategory, ServiceType, Unit, Vendor, Warehouse } from '@/types'
import ProductStock from '@/views/erp/products/ProductStock'

export const dynamic = 'force-dynamic'

export default async function ProductStockPage() {
  let productCategories: ProductCategory[] = []
  let uomUnits: Unit[] = []
  let vendors: Vendor[] = []
  let serviceTypes: ServiceType[] = []
  let warehouses: Warehouse[] = []
  let businessLocations: BusinessLocation[] = []

  try {
    const response = await ProductCategoryService.getAll()

    productCategories = response.data ?? []
  } catch (error) {
    productCategories = []
  }

  try {
    const response = await UnitService.getAll('uom')

    uomUnits = response.data ?? []
  } catch (error) {
    uomUnits = []
  }

  try {
    const response = await ServiceTypeService.getAll()

    serviceTypes = response.data ?? []
  } catch (error) {
    serviceTypes = []
  }

  try {
    const response = await VendorService.getAll()

    vendors = response.data ?? []
  } catch (error) {
    vendors = []
  }

  try {
    const response = await WarehouseService.getAll()

    warehouses = response.data ?? []
  } catch (error) {
    warehouses = []
  }

  try {
    const response = await BusinessLocationService.getAll()

    businessLocations = response.data ?? []
  } catch (error) {
    businessLocations = []
  }

  return (
    <ProductStock
      productCategories={productCategories}
      uomUnits={uomUnits}
      vendors={vendors}
      serviceTypes={serviceTypes}
      warehouses={warehouses}
      businessLocations={businessLocations}
    />
  )
}
