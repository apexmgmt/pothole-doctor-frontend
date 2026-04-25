import EstimateService from '@/services/api/estimates/estimates.service'
import ProposalService from '@/services/api/estimates/proposals.service'
import ProductCategoryService from '@/services/api/products/product_categories.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import UnitService from '@/services/api/settings/units.service'
import VendorService from '@/services/api/vendors/vendors.service'
import { Estimate, ProductCategory, Proposal, ServiceType, Unit, Vendor } from '@/types'
import { notFound } from 'next/navigation'
import CreateOrEditProposalView from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalView'

export const dynamic = 'force-dynamic'

const ProposalPage = async ({
  params,
  searchParams
}: {
  params: Promise<{ id: string; proposalId: string }>
  searchParams: Promise<{ mode?: string }>
}) => {
  const { id: estimateId, proposalId } = await params
  const { mode: modeParam } = await searchParams
  const isCreate = proposalId === 'create'
  const mode = isCreate ? 'create' : modeParam === 'view' ? 'view' : 'edit'

  const [estimateRes, serviceTypesRes, unitsRes, productCategoriesRes, uomUnitsRes, vendorsRes, proposalRes] =
    await Promise.allSettled([
      EstimateService.show(estimateId),
      ServiceTypeService.getAll(),
      UnitService.getAll(),
      ProductCategoryService.getAll(),
      UnitService.getAll('uom'),
      VendorService.getAll(),
      isCreate ? Promise.resolve({ data: null }) : ProposalService.show(proposalId)
    ])

  if (estimateRes.status === 'rejected') {
    notFound()
  }

  const estimate: Estimate =
    estimateRes.status === 'fulfilled' ? estimateRes.value.data || ({} as Estimate) : ({} as Estimate)

  const serviceTypes: ServiceType[] = serviceTypesRes.status === 'fulfilled' ? serviceTypesRes.value.data || [] : []
  const units: Unit[] = unitsRes.status === 'fulfilled' ? unitsRes.value.data || [] : []

  const productCategories: ProductCategory[] =
    productCategoriesRes.status === 'fulfilled' ? productCategoriesRes.value.data || [] : []

  const uomUnits: Unit[] = uomUnitsRes.status === 'fulfilled' ? uomUnitsRes.value.data || [] : []
  const vendors: Vendor[] = vendorsRes.status === 'fulfilled' ? vendorsRes.value.data || [] : []
  const proposal: Proposal | null = proposalRes.status === 'fulfilled' ? proposalRes.value.data || null : null

  const READ_ONLY_STATUSES = ['converted to invoice', 'void proposal', 'dead proposal']

  const resolvedMode =
    !isCreate && proposal?.status && READ_ONLY_STATUSES.includes(proposal.status) ? 'view' : mode

  return (
    <CreateOrEditProposalView
      mode={resolvedMode as 'create' | 'edit' | 'view'}
      estimateId={estimateId}
      estimateDetails={estimate}
      proposalId={isCreate ? null : proposalId}
      proposalDetails={proposal}
      serviceTypes={serviceTypes}
      units={units}
      productCategories={productCategories}
      uomUnits={uomUnits}
      vendors={vendors}
    />
  )
}

export default ProposalPage
