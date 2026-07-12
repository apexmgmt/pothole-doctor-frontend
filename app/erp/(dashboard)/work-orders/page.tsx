import ClientService from '@/services/api/clients/clients.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import StaffService from '@/services/api/staff.service'
import WorkOrderService from '@/services/api/work-orders/work_orders.service'
import {
  BusinessLocation,
  Client,
  EstimateType,
  PaymentTerm,
  ServiceType,
  Staff,
  WorkOrder,
  WorkOrderSummary,
  DataTableApiResponse
} from '@/types'
import WorkOrders from '@/views/erp/work-orders'
import { hasPermission } from '@/utils/role-permission'

export const dynamic = 'force-dynamic'

export default async function WorkOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  const [
    workOrderTypesRes,
    serviceTypesRes,
    clientsRes,
    staffsRes,
    paymentTermsRes,
    businessLocationsRes,
    workOrderSummaryRes
  ] = await Promise.allSettled([
    EstimateTypeService.getAll(),
    ServiceTypeService.getAll(),
    ClientService.getAll('customer'),
    StaffService.getAll(),
    PaymentTermsService.getAllPaymentTerms(),
    BusinessLocationService.getAll(),
    WorkOrderService.getSummary()
  ])

  let responseData: DataTableApiResponse<WorkOrder> | null = null

  try {
    const response = await WorkOrderService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch work orders:', error)
  }

  const [
    canManageEstimate,
    canManageProposal,
    canEditProposal,
    canManageInvoice,
    canEditInvoice,
    canEditWorkOrder,
    canDeleteWorkOrder
  ] = await Promise.all([
    hasPermission('Manage Estimate'),
    hasPermission('Manage Proposal'),
    hasPermission('Update Proposal'),
    hasPermission('Manage Invoice'),
    hasPermission('Update Invoice'),
    hasPermission('Update Work Order'),
    hasPermission('Delete Work Order')
  ])

  const workOrderTypes: EstimateType[] =
    workOrderTypesRes.status === 'fulfilled' ? workOrderTypesRes.value.data || [] : []

  const serviceTypes: ServiceType[] = serviceTypesRes.status === 'fulfilled' ? serviceTypesRes.value.data || [] : []
  const clients: Client[] = clientsRes.status === 'fulfilled' ? clientsRes.value.data || [] : []
  const staffs: Staff[] = staffsRes.status === 'fulfilled' ? staffsRes.value.data || [] : []
  const paymentTerms: PaymentTerm[] = paymentTermsRes.status === 'fulfilled' ? paymentTermsRes.value.data || [] : []

  const businessLocations: BusinessLocation[] =
    businessLocationsRes.status === 'fulfilled' ? businessLocationsRes.value.data || [] : []

  const initialSummary: WorkOrderSummary = {
    total_invoice_total: 0,
    total_invoice_subtotal: 0,
    total_invoice_total_tax: 0,
    total_commissions: 0,
    total_cost: 0,
    total_expenses: 0,
    total_profit: 0,
    total_material_cost: 0,
    total_freight_charge: 0,
    total_labor_cost: 0,
    total_net_profit: 0,
    total_profit_percentage: 0
  }

  const workOrderSummary: WorkOrderSummary  = workOrderSummaryRes.status === 'fulfilled' ? workOrderSummaryRes.value.data || initialSummary : initialSummary

  return (
    <WorkOrders
      workOrderTypes={workOrderTypes}
      serviceTypes={serviceTypes}
      clients={clients}
      staffs={staffs}
      paymentTerms={paymentTerms}
      businessLocations={businessLocations}
      workOrderSummary={workOrderSummary}
      initialData={responseData}
      permissions={{
        canManageEstimate,
        canManageProposal,
        canEditProposal,
        canManageInvoice,
        canEditInvoice,
        canEditWorkOrder,
        canDeleteWorkOrder
      }}
    />
  )
}
