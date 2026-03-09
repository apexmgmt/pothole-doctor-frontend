import ClientService from '@/services/api/clients/clients.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import ProductCategoryService from '@/services/api/product_categories.service'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import UnitService from '@/services/api/settings/units.service'
import StaffService from '@/services/api/staff.service'
import VendorService from '@/services/api/vendors/vendors.service'
import {
  BusinessLocation,
  Client,
  EstimateType,
  PaymentTerm,
  ProductCategory,
  ServiceType,
  Staff,
  Unit,
  Vendor
} from '@/types'
import Invoices from '@/views/erp/invoices'

export const dynamic = 'force-dynamic'

export default async function InvoicesPage() {
  let invoiceTypes: EstimateType[] = []
  let serviceTypes: ServiceType[] = []
  let clients: Client[] = []
  let staffs: Staff[] = []
  let paymentTerms: PaymentTerm[] = []
  let businessLocations: BusinessLocation[] = []
  let units: Unit[] = []
  let productCategories: ProductCategory[] = []
  let uomUnits: Unit[] = []
  let vendors: Vendor[] = []

  try {
    const response = await EstimateTypeService.getAll()

    invoiceTypes = response.data || []
  } catch {
    invoiceTypes = []
  }

  try {
    const response = await ServiceTypeService.getAll()

    serviceTypes = response.data || []
  } catch {
    serviceTypes = []
  }

  try {
    const response = await ClientService.getAll('customer')

    clients = response.data || []
  } catch {
    clients = []
  }

  try {
    const response = await StaffService.getAll()

    staffs = response.data || []
  } catch {
    staffs = []
  }

  try {
    const response = await PaymentTermsService.getAllPaymentTerms()

    paymentTerms = response.data || []
  } catch {
    paymentTerms = []
  }

  try {
    const response = await BusinessLocationService.getAll()

    businessLocations = response.data || []
  } catch {
    businessLocations = []
  }

  try {
    const response = await UnitService.getAll()

    units = response.data || []
  } catch {
    units = []
  }

  try {
    const response = await ProductCategoryService.getAll()

    productCategories = response.data || []
  } catch {
    productCategories = []
  }

  try {
    const response = await UnitService.getAll('uom')

    uomUnits = response.data || []
  } catch {
    uomUnits = []
  }

  try {
    const response = await VendorService.getAll()

    vendors = response.data || []
  } catch {
    vendors = []
  }

  return (
    <Invoices
      invoiceTypes={invoiceTypes}
      serviceTypes={serviceTypes}
      clients={clients}
      staffs={staffs}
      paymentTerms={paymentTerms}
      businessLocations={businessLocations}
      units={units}
      productCategories={productCategories}
      uomUnits={uomUnits}
      vendors={vendors}
    />
  )
}
