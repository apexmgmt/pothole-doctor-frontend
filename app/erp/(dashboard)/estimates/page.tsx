import ClientService from '@/services/api/clients/clients.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import StaffService from '@/services/api/staff.service'
import {
  BusinessLocation,
  Client,
  EstimateType,
  PaymentTerm,
  ServiceType,
  Staff,
  DataTableApiResponse,
  Estimate
} from '@/types'
import Estimates from '@/views/erp/estimates/Estimates'
import EstimateService from '@/services/api/estimates/estimates.service'
import { hasPermission } from '@/utils/role-permission'

export const dynamic = 'force-dynamic'

export default async function EstimatesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  const [serviceTypesRes, estimateTypesRes, clientsRes, staffsRes, paymentTermsRes, businessLocationsRes] =
    await Promise.allSettled([
      ServiceTypeService.getAll(),
      EstimateTypeService.getAll(),
      ClientService.getAll('customer'),
      StaffService.getAll(),
      PaymentTermsService.getAllPaymentTerms(),
      BusinessLocationService.getAll()
    ])

  let responseData: DataTableApiResponse<Estimate> | null = null

  try {
    const response = await EstimateService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch estimates:', error)
  }

  const [canCreateEstimate, canViewEstimate, canEditEstimate, canDeleteEstimate] = await Promise.all([
    hasPermission('Create Estimate'),
    hasPermission('View Estimate'),
    hasPermission('Update Estimate'),
    hasPermission('Delete Estimate')
  ])

  const serviceTypes: ServiceType[] = serviceTypesRes.status === 'fulfilled' ? serviceTypesRes.value.data || [] : []
  const estimateTypes: EstimateType[] = estimateTypesRes.status === 'fulfilled' ? estimateTypesRes.value.data || [] : []
  const clients: Client[] = clientsRes.status === 'fulfilled' ? clientsRes.value.data || [] : []
  const staffs: Staff[] = staffsRes.status === 'fulfilled' ? staffsRes.value.data || [] : []
  const paymentTerms: PaymentTerm[] = paymentTermsRes.status === 'fulfilled' ? paymentTermsRes.value.data || [] : []

  const businessLocations: BusinessLocation[] =
    businessLocationsRes.status === 'fulfilled' ? businessLocationsRes.value.data || [] : []

  return (
    <Estimates
      serviceTypes={serviceTypes}
      estimateTypes={estimateTypes}
      clients={clients}
      staffs={staffs}
      paymentTerms={paymentTerms}
      businessLocations={businessLocations}
      initialData={responseData}
      permissions={{ canCreateEstimate, canViewEstimate, canEditEstimate, canDeleteEstimate }}
    />
  )
}
