import { notFound } from 'next/navigation'

import ClientService from '@/services/api/clients/clients.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import ProductCategoryService from '@/services/api/products/product_categories.service'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import UnitService from '@/services/api/settings/units.service'
import StaffService from '@/services/api/staff.service'
import VendorService from '@/services/api/vendors/vendors.service'
import InvoiceService from '@/services/api/invoices/invoices.service'
import {
  BusinessLocation,
  Client,
  EstimateType,
  Invoice,
  PaymentTerm,
  ProductCategory,
  ServiceType,
  Staff,
  Unit,
  Vendor
} from '@/types'
import AddInvoiceServicesView from '@/views/erp/invoices/AddInvoiceServicesView'

export const dynamic = 'force-dynamic'

const InvoiceServicesPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  const [
    invoiceRes,
    invoiceTypesRes,
    serviceTypesRes,
    clientsRes,
    staffsRes,
    paymentTermsRes,
    businessLocationsRes,
    unitsRes,
    productCategoriesRes,
    uomUnitsRes,
    vendorsRes
  ] = await Promise.allSettled([
    InvoiceService.show(id),
    EstimateTypeService.getAll(),
    ServiceTypeService.getAll(),
    ClientService.getAll('customer'),
    StaffService.getAll(),
    PaymentTermsService.getAllPaymentTerms(),
    BusinessLocationService.getAll(),
    UnitService.getAll(),
    ProductCategoryService.getAll(),
    UnitService.getAll('uom'),
    VendorService.getAll()
  ])

  if (invoiceRes.status === 'rejected') {
    notFound()
  }

  const invoice: Invoice = invoiceRes.status === 'fulfilled' ? invoiceRes.value.data : null

  if (!invoice) {
    notFound()
  }

  const invoiceTypes: EstimateType[] = invoiceTypesRes.status === 'fulfilled' ? invoiceTypesRes.value.data || [] : []

  const serviceTypes: ServiceType[] = serviceTypesRes.status === 'fulfilled' ? serviceTypesRes.value.data || [] : []
  const clients: Client[] = clientsRes.status === 'fulfilled' ? clientsRes.value.data || [] : []
  const staffs: Staff[] = staffsRes.status === 'fulfilled' ? staffsRes.value.data || [] : []
  const paymentTerms: PaymentTerm[] = paymentTermsRes.status === 'fulfilled' ? paymentTermsRes.value.data || [] : []

  const businessLocations: BusinessLocation[] =
    businessLocationsRes.status === 'fulfilled' ? businessLocationsRes.value.data || [] : []

  const units: Unit[] = unitsRes.status === 'fulfilled' ? unitsRes.value.data || [] : []

  const productCategories: ProductCategory[] =
    productCategoriesRes.status === 'fulfilled' ? productCategoriesRes.value.data || [] : []

  const uomUnits: Unit[] = uomUnitsRes.status === 'fulfilled' ? uomUnitsRes.value.data || [] : []
  const vendors: Vendor[] = vendorsRes.status === 'fulfilled' ? vendorsRes.value.data || [] : []

  return (
    <AddInvoiceServicesView
      invoice={invoice}
      serviceTypes={serviceTypes}
      units={units}
      productCategories={productCategories}
      uomUnits={uomUnits}
      vendors={vendors}
      invoiceTypes={invoiceTypes}
      clients={clients}
      staffs={staffs}
      paymentTerms={paymentTerms}
      businessLocations={businessLocations}
    />
  )
}

export default InvoiceServicesPage
