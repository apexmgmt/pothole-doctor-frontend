import { Metadata } from 'next'
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
  Invoice,
  InvoiceSummary,
  PaymentTerm,
  ProductCategory,
  ServiceType,
  Staff,
  Unit,
  Vendor,
  DataTableApiResponse
} from '@/types'
import Invoices from '@/views/erp/invoices'
import { hasPermission } from '@/utils/role-permission'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pothole Doctors'

export const metadata: Metadata = {
  title: `Manage Invoices | ${APP_NAME}`,
  description: `Manage your ${APP_NAME} invoices.`
}

export const dynamic = 'force-dynamic'

export default async function InvoicesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  const [
    invoiceTypesRes,
    serviceTypesRes,
    clientsRes,
    staffsRes,
    paymentTermsRes,
    businessLocationsRes,
    invoicesSummaryRes
  ] = await Promise.allSettled([
    EstimateTypeService.getAll(),
    ServiceTypeService.getAll(),
    ClientService.getAll('customer'),
    StaffService.getAll(),
    PaymentTermsService.getAllPaymentTerms(),
    BusinessLocationService.getAll(),
    InvoiceService.getSummary()
  ])

  let responseData: DataTableApiResponse<Invoice> | null = null

  try {
    const response = await InvoiceService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch invoices:', error)
  }

  const [canCreate, canView, canEdit, canDelete] = await Promise.all([
    hasPermission('Create Invoice'),
    hasPermission('View Invoice'),
    hasPermission('Update Invoice'),
    hasPermission('Delete Invoice')
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

  const invoicesSummary =
    invoicesSummaryRes.status === 'fulfilled' ? invoicesSummaryRes.value.data || initialSummary : initialSummary

  return (
    <Invoices
      invoiceTypes={invoiceTypes}
      serviceTypes={serviceTypes}
      clients={clients}
      staffs={staffs}
      paymentTerms={paymentTerms}
      businessLocations={businessLocations}
      invoicesSummary={invoicesSummary}
      initialData={responseData}
      permissions={{ canCreate, canView, canEdit, canDelete }}
    />
  )
}
