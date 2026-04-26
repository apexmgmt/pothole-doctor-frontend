import ClientService from '@/services/api/clients/clients.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import StaffService from '@/services/api/staff.service'
import { BusinessLocation, Client, EstimateType, PaymentTerm, ServiceType, Staff } from '@/types'
import Estimates from '@/views/erp/estimates/Estimates'

export const dynamic = 'force-dynamic'

export default async function EstimatesPage() {
  const [serviceTypesRes, estimateTypesRes, clientsRes, staffsRes, paymentTermsRes, businessLocationsRes] =
    await Promise.allSettled([
      ServiceTypeService.getAll(),
      EstimateTypeService.getAll(),
      ClientService.getAll('customer'),
      StaffService.getAll(),
      PaymentTermsService.getAllPaymentTerms(),
      BusinessLocationService.getAll()
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
    />
  )
}
