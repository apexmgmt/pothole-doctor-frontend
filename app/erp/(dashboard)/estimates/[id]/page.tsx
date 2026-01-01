import ClientService from '@/services/api/clients/clients.service'
import EstimateService from '@/services/api/estimates/estimates.service'
import ProductCategoryService from '@/services/api/product_categories.service'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import UnitService from '@/services/api/settings/units.service'
import StaffService from '@/services/api/staff.service'
import VendorService from '@/services/api/vendors/vendors.service'
import { Client, Estimate, EstimateType, PaymentTerm, ProductCategory, ServiceType, Staff, Unit, Vendor } from '@/types'
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

  //fetch units
  try {
    const response = await UnitService.getAllUnits()

    units = response.data || []
  } catch (error) {
    units = []
  }

  try {
    const response = await ProductCategoryService.getAllProductCategories()

    productCategories = response.data || []
  } catch (error) {
    productCategories = []
  }

  try {
    const response = await UnitService.getAllUnits('uom')

    uomUnits = response.data || []
  } catch (error) {
    uomUnits = []
  }

  try {
    const response = await VendorService.getAllVendors()

    vendors = response.data || []
  } catch (error) {
    vendors = []
  }

  return (
    <EstimateDetails
      estimateId={id}
      estimate={estimate}
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
