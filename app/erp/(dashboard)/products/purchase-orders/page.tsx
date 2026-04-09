import CourierService from '@/services/api/couriers.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import ProductCategoryService from '@/services/api/products/product_categories.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import VendorService from '@/services/api/vendors/vendors.service'
import WarehouseService from '@/services/api/warehouses.service'
import { BusinessLocation, Courier, ProductCategory, ServiceType, Vendor, Warehouse } from '@/types'
import PurchaseOrders from '@/views/erp/products/purchase-orders/PurchaseOrders'

export default async function PurchaseOrdersPage() {
  const [vendorsRes, warehousesRes, businessLocationsRes, couriersRes, productCategoriesRes, serviceTypesRes] =
    await Promise.allSettled([
      VendorService.getAll(),
      WarehouseService.getAll(),
      BusinessLocationService.getAll(),
      CourierService.getAll(),
      ProductCategoryService.getAll(),
      ServiceTypeService.getAll()
    ])

  const vendors: Vendor[] = vendorsRes.status === 'fulfilled' ? ((vendorsRes.value.data as Vendor[]) ?? []) : []

  const warehouses: Warehouse[] =
    warehousesRes.status === 'fulfilled' ? ((warehousesRes.value.data as Warehouse[]) ?? []) : []

  const businessLocations: BusinessLocation[] =
    businessLocationsRes.status === 'fulfilled' ? ((businessLocationsRes.value.data as BusinessLocation[]) ?? []) : []

  const couriers: Courier[] = couriersRes.status === 'fulfilled' ? ((couriersRes.value.data as Courier[]) ?? []) : []

  const productCategories: ProductCategory[] =
    productCategoriesRes.status === 'fulfilled' ? ((productCategoriesRes.value.data as ProductCategory[]) ?? []) : []

  const serviceTypes: ServiceType[] =
    serviceTypesRes.status === 'fulfilled' ? ((serviceTypesRes.value.data as ServiceType[]) ?? []) : []

  return (
    <PurchaseOrders
      vendors={vendors}
      warehouses={warehouses}
      businessLocations={businessLocations}
      couriers={couriers}
      productCategories={productCategories}
      serviceTypes={serviceTypes}
    />
  )
}
