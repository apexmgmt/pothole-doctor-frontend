'use client'

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
import ProposalSection from './ProposalSection'
import PerformTakeOfSection from './PerformTakeOfSection'
import NotesSection from './NotesSection'
import EstimateSection from './EstimateSection'
import { useEffect } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'

const EstimateDetails = ({
  estimateId,
  estimate,
  estimateNotes,
  serviceTypes,
  estimateTypes,
  clients,
  staffs,
  paymentTerms,
  units,
  productCategories,
  uomUnits,
  vendors,
  businessLocations
}: {
  estimateId: string
  estimate: Estimate
  estimateNotes: EstimateNote[]
  serviceTypes: ServiceType[]
  estimateTypes: EstimateType[]
  clients: Client[]
  staffs: Staff[]
  paymentTerms: PaymentTerm[]
  units: Unit[]
  productCategories: ProductCategory[]
  uomUnits: Unit[]
  vendors: Vendor[]
  businessLocations: BusinessLocation[]
}) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(
      setPageTitle(`Estimate Details - ${estimate.title}(#${estimate.estimate_number.toString().padStart(6, '0')})`)
    )
  }, [])

  return (
    <>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 items-start'>
        <ProposalSection
          estimateId={estimateId}
          estimateDetails={estimate}
          serviceTypes={serviceTypes}
          units={units}
          productCategories={productCategories}
          uomUnits={uomUnits}
          vendors={vendors}
        />
        <div className='flex flex-col gap-4'>
          <PerformTakeOfSection estimate={estimate} />
          <NotesSection estimateId={estimateId} estimateNotes={estimateNotes} />
        </div>
        <EstimateSection
          estimateId={estimateId}
          estimate={estimate}
          serviceTypes={serviceTypes}
          estimateTypes={estimateTypes}
          clients={clients}
          staffs={staffs}
          paymentTerms={paymentTerms}
          businessLocations={businessLocations}
        />
      </div>
    </>
  )
}

export default EstimateDetails
