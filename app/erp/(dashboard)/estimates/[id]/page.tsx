import ClientService from '@/services/api/clients/clients.service'
import EstimateService from '@/services/api/estimates.service'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import StaffService from '@/services/api/staff.service'
import { Client, Estimate, EstimateType, PaymentTerm, ServiceType, Staff } from '@/types'
import EstimateDetails from '@/views/erp/estimates/EstimateDetails'

const EstimateDetailsPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params
  let estimate: Estimate = {} as Estimate
  let serviceTypes: ServiceType[] = []
  let estimateTypes: EstimateType[] = []
  let clients: Client[] = []
  let staffs: Staff[] = []
  let paymentTerms: PaymentTerm[] = []

  try {
    const response = await ServiceTypeService.getAllServiceTypes()

    serviceTypes = response.data || []
  } catch (error) {
    serviceTypes = []
  }

  try {
    const response = await EstimateTypeService.getAllEstimateTypes()

    estimateTypes = response.data || []
  } catch (error) {
    estimateTypes = []
  }

  try {
    const response = await ClientService.getAllClients('customer')

    clients = response.data || []
  } catch (error) {
    clients = []
  }

  try {
    const response = await StaffService.getAllStaffs()

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

  // fetch estimate details
  try {
    const response = await EstimateService.show(id)

    estimate = response.data
  } catch (error) {
    estimate = {} as Estimate
  }

  return <EstimateDetails estimateId={id} estimate={estimate} serviceTypes={serviceTypes} estimateTypes={estimateTypes} clients={clients} staffs={staffs} paymentTerms={paymentTerms} />
}

export default EstimateDetailsPage
