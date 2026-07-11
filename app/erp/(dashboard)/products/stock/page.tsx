import { Metadata } from 'next'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import ProductCategoryService from '@/services/api/products/product_categories.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import UnitService from '@/services/api/settings/units.service'
import VendorService from '@/services/api/vendors/vendors.service'
import WarehouseService from '@/services/api/warehouses.service'
import ProductService from '@/services/api/products/products.service'
import {
  BusinessLocation,
  ProductCategory,
  ServiceType,
  Unit,
  Vendor,
  Warehouse,
  DataTableApiResponse,
  Product
} from '@/types'
import ProductStock from '@/views/erp/products/ProductStock'
import { hasPermission } from '@/utils/role-permission'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pothole Doctors'

export const metadata: Metadata = {
  title: `Manage Product Stock | ${APP_NAME}`,
  description: `Manage your ${APP_NAME} product stock.`
}

export const dynamic = 'force-dynamic'

export default async function ProductStockPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  const [productCategoriesRes, uomUnitsRes, serviceTypesRes, vendorsRes, warehousesRes, businessLocationsRes] =
    await Promise.allSettled([
      ProductCategoryService.getAll(),
      UnitService.getAll('uom'),
      ServiceTypeService.getAll(),
      VendorService.getAll(),
      WarehouseService.getAll(),
      BusinessLocationService.getAll()
    ])

  const initialFilters = { ...resolvedSearchParams, type: 'inventory' }
  let responseData: DataTableApiResponse<Product> | null = null

  try {
    const response = await ProductService.index(initialFilters as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch product stock:', error)
  }

  const [canCreateProduct, canViewProduct, canEditProduct, canDeleteProduct] = await Promise.all([
    hasPermission('Create Product'),
    hasPermission('View Product'),
    hasPermission('Update Product'),
    hasPermission('Delete Product')
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
      initialData={responseData}
      permissions={{ canCreateProduct, canViewProduct, canEditProduct, canDeleteProduct }}
    />
  )
}
