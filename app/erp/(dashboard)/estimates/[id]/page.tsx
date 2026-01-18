import ClientService from '@/services/api/clients/clients.service'
import EstimateNoteService from '@/services/api/estimates/estimate-notes.service'
import EstimateService from '@/services/api/estimates/estimates.service'
import ProductCategoryService from '@/services/api/product_categories.service'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import UnitService from '@/services/api/settings/units.service'
import StaffService from '@/services/api/staff.service'
import VendorService from '@/services/api/vendors/vendors.service'
import {
  Client,
  Estimate,
  EstimateType,
  PaymentTerm,
  ProductCategory,
  ServiceType,
  Staff,
  Unit,
  Vendor,
  EstimateNote
} from '@/types'
import EstimateDetails from '@/views/erp/estimates/EstimateDetails'

const EstimateDetailsPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params
  let estimate: Estimate = {} as Estimate
  let serviceTypes: ServiceType[] = []
  let estimateTypes: EstimateType[] = []
  let clients: Client[] = []
  let staffs: Staff[] = []
  let paymentTerms: PaymentTerm[] = []
  let units: Unit[] = []
  let productCategories: ProductCategory[] = []
  let uomUnits: Unit[] = []
  let vendors: Vendor[] = []
  let estimateNotes: EstimateNote[] = []

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

  // fetch estimate details
  try {
    const response = await EstimateService.show(id)

    estimate = response.data
  } catch (error) {
    estimate = {} as Estimate
  }

  // fetch estimate notes
  try {
    const response = await EstimateNoteService.index({ estimate_id: id })

    estimateNotes = response.data || []
  } catch (error) {
    estimateNotes = []
  }

  //fetch units
  try {
    const response = await UnitService.getAll()

    units = response.data || []
  } catch (error) {
    units = []
  }

  try {
    const response = await ProductCategoryService.getAll()

    productCategories = response.data || []
  } catch (error) {
    productCategories = []
  }

  try {
    const response = await UnitService.getAll('uom')

    uomUnits = response.data || []
  } catch (error) {
    uomUnits = []
  }

  try {
    const response = await VendorService.getAll()

    vendors = response.data || []
  } catch (error) {
    vendors = []
  }

  return (
    <EstimateDetails
      estimateId={id}
      estimate={estimate}
      estimateNotes={estimateNotes}
      serviceTypes={serviceTypes}
      estimateTypes={estimateTypes}
      clients={clients}
      staffs={staffs}
      paymentTerms={paymentTerms}
      units={units}
      productCategories={productCategories}
      uomUnits={uomUnits}
      vendors={vendors}
    />
  )
}

export default EstimateDetailsPage
