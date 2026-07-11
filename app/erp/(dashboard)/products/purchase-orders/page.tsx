import { Metadata } from 'next'
import CourierService from '@/services/api/couriers.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import ProductCategoryService from '@/services/api/products/product_categories.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import VendorService from '@/services/api/vendors/vendors.service'
import WarehouseService from '@/services/api/warehouses.service'
import PurchaseOrderService from '@/services/api/products/purchase_orders.service'
import {
  BusinessLocation,
  Courier,
  ProductCategory,
  ServiceType,
  Vendor,
  Warehouse,
  DataTableApiResponse,
  PurchaseOrder
} from '@/types'
import PurchaseOrders from '@/views/erp/products/purchase-orders/PurchaseOrders'
import { hasPermission } from '@/utils/role-permission'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pothole Doctors'

export const metadata: Metadata = {
  title: `Manage Purchase Orders | ${APP_NAME}`,
  description: `Manage your ${APP_NAME} purchase orders.`
}

export const dynamic = 'force-dynamic'

export default async function PurchaseOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  const [vendorsRes, warehousesRes, businessLocationsRes, couriersRes, productCategoriesRes, serviceTypesRes] =
    await Promise.allSettled([
      VendorService.getAll(),
      WarehouseService.getAll(),
      BusinessLocationService.getAll(),
      CourierService.getAll(),
      ProductCategoryService.getAll(),
      ServiceTypeService.getAll()
    ])

  let responseData: DataTableApiResponse<PurchaseOrder> | null = null

  try {
    const response = await PurchaseOrderService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch purchase orders:', error)
  }

  const [canCreatePO, canViewPO, canEditPO, canDeletePO] = await Promise.all([
    hasPermission('Create Purchase Order'),
    hasPermission('View Purchase Order'),
    hasPermission('Update Purchase Order'),
    hasPermission('Delete Purchase Order')
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
      initialData={responseData}
      permissions={{ canCreatePO, canViewPO, canEditPO, canDeletePO }}
    />
  )
}
