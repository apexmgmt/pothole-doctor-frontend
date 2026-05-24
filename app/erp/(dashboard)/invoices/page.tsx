import ClientService from '@/services/api/clients/clients.service'
import InvoiceService from '@/services/api/invoices/invoices.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import ProductCategoryService from '@/services/api/products/product_categories.service'
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
  InvoiceSummary,
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
  const [
    invoiceTypesRes,
    serviceTypesRes,
    clientsRes,
    staffsRes,
    paymentTermsRes,
    businessLocationsRes,
    invoicesSummaryRes

    // unitsRes,
    // productCategoriesRes,
    // uomUnitsRes,
    // vendorsRes
  ] = await Promise.allSettled([
    EstimateTypeService.getAll(),
    ServiceTypeService.getAll(),
    ClientService.getAll('customer'),
    StaffService.getAll(),
    PaymentTermsService.getAllPaymentTerms(),
    BusinessLocationService.getAll(),
    InvoiceService.getSummary()

    // UnitService.getAll(),
    // ProductCategoryService.getAll(),
    // UnitService.getAll('uom'),
    // VendorService.getAll()
  ])

  const invoiceTypes: EstimateType[] = invoiceTypesRes.status === 'fulfilled' ? invoiceTypesRes.value.data || [] : []
  const serviceTypes: ServiceType[] = serviceTypesRes.status === 'fulfilled' ? serviceTypesRes.value.data || [] : []
  const clients: Client[] = clientsRes.status === 'fulfilled' ? clientsRes.value.data || [] : []
  const staffs: Staff[] = staffsRes.status === 'fulfilled' ? staffsRes.value.data || [] : []
  const paymentTerms: PaymentTerm[] = paymentTermsRes.status === 'fulfilled' ? paymentTermsRes.value.data || [] : []

  const businessLocations: BusinessLocation[] =
    businessLocationsRes.status === 'fulfilled' ? businessLocationsRes.value.data || [] : []

    const initialSummary: InvoiceSummary = {
      total_material_sale: 0,
      total_labor_sale: 0,
      total_discount: 0,
      total_sale: 0,
      total_tax: 0,
      total_work_order_cost: 0,
      total_work_order_profit: 0,
      total_work_order_net_profit: 0,
      invoices_count: 0
    }

  const invoicesSummary = invoicesSummaryRes.status === 'fulfilled' ? invoicesSummaryRes.value.data || initialSummary : initialSummary

  // const units: Unit[] = unitsRes.status === 'fulfilled' ? unitsRes.value.data || [] : []

  // const productCategories: ProductCategory[] =
  //   productCategoriesRes.status === 'fulfilled' ? productCategoriesRes.value.data || [] : []

  // const uomUnits: Unit[] = uomUnitsRes.status === 'fulfilled' ? uomUnitsRes.value.data || [] : []
  // const vendors: Vendor[] = vendorsRes.status === 'fulfilled' ? vendorsRes.value.data || [] : []

  return (
    <Invoices
      invoiceTypes={invoiceTypes}
      serviceTypes={serviceTypes}
      clients={clients}
      staffs={staffs}
      paymentTerms={paymentTerms}
      businessLocations={businessLocations}
      invoicesSummary={invoicesSummary}

      // units={units}
      // productCategories={productCategories}
      // uomUnits={uomUnits}
      // vendors={vendors}
    />
  )
}
