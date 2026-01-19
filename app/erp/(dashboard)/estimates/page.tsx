import ClientService from '@/services/api/clients/clients.service'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import StaffService from '@/services/api/staff.service'
import { Client, EstimateType, PaymentTerm, ServiceType, Staff } from '@/types'
import Estimates from '@/views/erp/estimates/Estimates'

export default async function EstimatesPage() {
  let serviceTypes: ServiceType[] = []
  let estimateTypes: EstimateType[] = []
  let clients: Client[] = []
  let staffs: Staff[] = []
  let paymentTerms: PaymentTerm[] = []

  try {
    const response = await ServiceTypeService.getAll()

    serviceTypes = response.data || []
  } catch (error) {
    serviceTypes = []
  }

  try {
    const response = await EstimateTypeService.getAll()

    estimateTypes = response.data || []
  } catch (error) {
    estimateTypes = []
  }

  try {
    const response = await ClientService.getAll('customer')

    clients = response.data || []
  } catch (error) {
    clients = []
  }

  try {
    const response = await StaffService.getAll()

    staffs = response.data || []
  } catch (error) {
    staffs = []
  }

  try {
    const response = await PaymentTermsService.getAllPaymentTerms()

    paymentTerms = response.data || []
  } catch (error) {
    paymentTerms = []
  }

  return (
    <Estimates
      serviceTypes={serviceTypes}
      estimateTypes={estimateTypes}
      clients={clients}
      staffs={staffs}
      paymentTerms={paymentTerms}
    />
  )
}
