import ClientService from '@/services/api/clients/clients.service'
import EstimateNoteService from '@/services/api/estimates/estimate-notes.service'
import EstimateService from '@/services/api/estimates/estimates.service'
import ProductCategoryService from '@/services/api/products/product_categories.service'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import UnitService from '@/services/api/settings/units.service'
import StaffService from '@/services/api/staff.service'
import VendorService from '@/services/api/vendors/vendors.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import {
  BusinessLocation,
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

export const dynamic = 'force-dynamic'

const EstimateDetailsPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const [
    serviceTypesRes,
    estimateTypesRes,
    clientsRes,
    staffsRes,
    paymentTermsRes,
    estimateRes,
    estimateNotesRes,
    unitsRes,
    productCategoriesRes,
    uomUnitsRes,
    vendorsRes,
    businessLocationsRes
  ] = await Promise.allSettled([
    ServiceTypeService.getAll(),
    EstimateTypeService.getAll(),
    ClientService.getAll('customer'),
    StaffService.getAll(),
    PaymentTermsService.getAllPaymentTerms(),
    EstimateService.show(id),
    EstimateNoteService.index({ estimate_id: id }),
    UnitService.getAll(),
    ProductCategoryService.getAll(),
    UnitService.getAll('uom'),
    VendorService.getAll(),
    BusinessLocationService.getAll()
  ])

  const serviceTypes: ServiceType[] = serviceTypesRes.status === 'fulfilled' ? serviceTypesRes.value.data || [] : []
  const estimateTypes: EstimateType[] = estimateTypesRes.status === 'fulfilled' ? estimateTypesRes.value.data || [] : []
  const clients: Client[] = clientsRes.status === 'fulfilled' ? clientsRes.value.data || [] : []
  const staffs: Staff[] = staffsRes.status === 'fulfilled' ? staffsRes.value.data || [] : []
  const paymentTerms: PaymentTerm[] = paymentTermsRes.status === 'fulfilled' ? paymentTermsRes.value.data || [] : []
  const estimate: Estimate = estimateRes.status === 'fulfilled' ? estimateRes.value.data || {} : ({} as Estimate)
  const estimateNotes: EstimateNote[] = estimateNotesRes.status === 'fulfilled' ? estimateNotesRes.value.data || [] : []
  const units: Unit[] = unitsRes.status === 'fulfilled' ? unitsRes.value.data || [] : []

  const productCategories: ProductCategory[] =
    productCategoriesRes.status === 'fulfilled' ? productCategoriesRes.value.data || [] : []

  const uomUnits: Unit[] = uomUnitsRes.status === 'fulfilled' ? uomUnitsRes.value.data || [] : []
  const vendors: Vendor[] = vendorsRes.status === 'fulfilled' ? vendorsRes.value.data || [] : []

  const businessLocations: BusinessLocation[] =
    businessLocationsRes.status === 'fulfilled' ? businessLocationsRes.value.data || [] : []

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
      businessLocations={businessLocations}
    />
  )
}

export default EstimateDetailsPage
