import ProductCategoryService from '@/services/api/products/product_categories.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import UnitService from '@/services/api/settings/units.service'
import VendorService from '@/services/api/vendors/vendors.service'
import { ProductCategory, ServiceType, Unit, Vendor } from '@/types'
import CreateOrEditServiceTemplateView from '@/views/erp/settings/ServiceTemplates/CreateOrEditServiceTemplateView'

export const dynamic = 'force-dynamic'

const CreateServiceTemplatePage = async () => {
  const [serviceTypesRes, unitsRes, productCategoriesRes, uomUnitsRes, vendorsRes] = await Promise.allSettled([
    ServiceTypeService.getAll(),
    UnitService.getAll(),
    ProductCategoryService.getAll(),
    UnitService.getAll('uom'),
    VendorService.getAll()
  ])

  const serviceTypes: ServiceType[] = serviceTypesRes.status === 'fulfilled' ? serviceTypesRes.value.data || [] : []
  const units: Unit[] = unitsRes.status === 'fulfilled' ? unitsRes.value.data || [] : []

  const productCategories: ProductCategory[] =
    productCategoriesRes.status === 'fulfilled' ? productCategoriesRes.value.data || [] : []

  const uomUnits: Unit[] = uomUnitsRes.status === 'fulfilled' ? uomUnitsRes.value.data || [] : []
  const vendors: Vendor[] = vendorsRes.status === 'fulfilled' ? vendorsRes.value.data || [] : []

  return (
    <CreateOrEditServiceTemplateView
      serviceTypes={serviceTypes}
      units={units}
      productCategories={productCategories}
      uomUnits={uomUnits}
      vendors={vendors}
    />
  )
}

export default CreateServiceTemplatePage
