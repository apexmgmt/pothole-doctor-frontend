import { Metadata } from 'next'
import ProductCategoryService from '@/services/api/products/product_categories.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import UnitService from '@/services/api/settings/units.service'
import VendorService from '@/services/api/vendors/vendors.service'
import ProductService from '@/services/api/products/products.service'
import { ProductCategory, ServiceType, Unit, Vendor, DataTableApiResponse, Product } from '@/types'
import NonInventoryProducts from '@/views/erp/products/NonInventoryProducts'
import { hasPermission } from '@/utils/role-permission'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pothole Doctors'

export const metadata: Metadata = {
  title: `Manage Non-Inventory Products | ${APP_NAME}`,
  description: `Manage your ${APP_NAME} non-inventory products.`
}

export const dynamic = 'force-dynamic'

export default async function NonInventoryProductsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  const [productCategoriesRes, uomUnitsRes, serviceTypesRes, vendorsRes] = await Promise.allSettled([
    ProductCategoryService.getAll(),
    UnitService.getAll('uom'),
    ServiceTypeService.getAll(),
    VendorService.getAll()
  ])

  let responseData: DataTableApiResponse<Product> | null = null

  try {
    const response = await ProductService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch non-inventory products:', error)
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

  return (
    <NonInventoryProducts
      productCategories={productCategories}
      uomUnits={uomUnits}
      vendors={vendors}
      serviceTypes={serviceTypes}
      initialData={responseData}
      permissions={{ canCreateProduct, canViewProduct, canEditProduct, canDeleteProduct }}
    />
  )
}
