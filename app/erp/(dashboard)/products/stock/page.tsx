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
  const [productCategoriesRes, uomUnitsRes, serviceTypesRes, vendorsRes, warehousesRes, businessLocationsRes] =
    await Promise.allSettled([
      ProductCategoryService.getAll(),
      UnitService.getAll('uom'),
      ServiceTypeService.getAll(),
      VendorService.getAll(),
      WarehouseService.getAll(),
      BusinessLocationService.getAll()
    ])

  const productCategories: ProductCategory[] =
    productCategoriesRes.status === 'fulfilled' ? (productCategoriesRes.value.data ?? []) : []

  const uomUnits: Unit[] = uomUnitsRes.status === 'fulfilled' ? (uomUnitsRes.value.data ?? []) : []
  const serviceTypes: ServiceType[] = serviceTypesRes.status === 'fulfilled' ? (serviceTypesRes.value.data ?? []) : []
  const vendors: Vendor[] = vendorsRes.status === 'fulfilled' ? (vendorsRes.value.data ?? []) : []
  const warehouses: Warehouse[] = warehousesRes.status === 'fulfilled' ? (warehousesRes.value.data ?? []) : []

  const businessLocations: BusinessLocation[] =
    businessLocationsRes.status === 'fulfilled' ? (businessLocationsRes.value.data ?? []) : []

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
