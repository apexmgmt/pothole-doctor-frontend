import ProductCategoryService from '@/services/api/products/product_categories.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import UnitService from '@/services/api/settings/units.service'
import VendorService from '@/services/api/vendors/vendors.service'
import { ProductCategory, ServiceType, Unit, Vendor } from '@/types'
import NonInventoryProducts from '@/views/erp/products/NonInventoryProducts'

export const dynamic = 'force-dynamic'

export default async function NonInventoryProductsPage() {
  const [productCategoriesRes, uomUnitsRes, serviceTypesRes, vendorsRes] = await Promise.allSettled([
    ProductCategoryService.getAll(),
    UnitService.getAll('uom'),
    ServiceTypeService.getAll(),
    VendorService.getAll()
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
    />
  )
}
