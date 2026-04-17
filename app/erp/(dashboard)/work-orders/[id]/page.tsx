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
import WorkOrderService from '@/services/api/work-orders/work_orders.service'
import {
  BusinessLocation,
  Client,
  EstimateType,
  PaymentTerm,
  ProductCategory,
  ServiceType,
  Staff,
  Unit,
  Vendor,
  WorkOrder
} from '@/types'
import EditWorkOrderServicesView from '@/views/erp/work-orders/EditWorkOrderServicesView'

export const dynamic = 'force-dynamic'

const WorkOrderServicesPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  const [
    workOrderRes,
    workOrderTypesRes,
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
    WorkOrderService.show(id),
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

  if (workOrderRes.status === 'rejected') {
    notFound()
  }

  const workOrder: WorkOrder = workOrderRes.status === 'fulfilled' ? workOrderRes.value.data : null

  if (!workOrder) {
    notFound()
  }

  const workOrderTypes: EstimateType[] =
    workOrderTypesRes.status === 'fulfilled' ? workOrderTypesRes.value.data || [] : []

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
    <EditWorkOrderServicesView
      workOrder={workOrder}
      serviceTypes={serviceTypes}
      units={units}
      productCategories={productCategories}
      uomUnits={uomUnits}
      vendors={vendors}
      workOrderTypes={workOrderTypes}
      clients={clients}
      staffs={staffs}
      paymentTerms={paymentTerms}
      businessLocations={businessLocations}
    />
  )
}

export default WorkOrderServicesPage
