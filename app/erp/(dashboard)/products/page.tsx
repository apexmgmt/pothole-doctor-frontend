import ProductCategoryService from '@/services/api/product_categories.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import UnitService from '@/services/api/settings/units.service'
import VendorService from '@/services/api/vendors/vendors.service'
import { ProductCategory, ServiceType, Unit, Vendor } from '@/types'
import Products from '@/views/erp/products/Products'

export default async function ProductsPage() {
  let productCategories: ProductCategory[] = []
  let uomUnits: Unit[] = []
  let vendors: Vendor[] = []
  let serviceTypes: ServiceType[] = []

  try {
    const response = await ProductCategoryService.getAllProductCategories()
    productCategories = response.data || []
  } catch (error) {
    productCategories = []
  }

  try {
    const response = await UnitService.getAllUnits('uom')
    uomUnits = response.data || []
  } catch (error) {
    uomUnits = []
  }

  try {
    const response = await ServiceTypeService.getAllServiceTypes()
    serviceTypes = response.data || []
  } catch (error) {
    serviceTypes = []
  }

  try {
    const response = await VendorService.getAllVendors()
    vendors = response.data || []
  } catch (error) {
    vendors = []
  }

  return (
    <Products productCategories={productCategories} uomUnits={uomUnits} vendors={vendors} serviceTypes={serviceTypes} />
  )
}
