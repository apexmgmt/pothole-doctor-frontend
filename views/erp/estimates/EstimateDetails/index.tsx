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
      <div className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 items-start'>
        <div className='order-2 2xl:order-1'>
          <ProposalSection
            estimateId={estimateId}
            estimateDetails={estimate}
            serviceTypes={serviceTypes}
            units={units}
            productCategories={productCategories}
            uomUnits={uomUnits}
            vendors={vendors}
          />
        </div>
        <div className='order-3 2xl:order-2 flex flex-col gap-4'>
          <PerformTakeOfSection estimate={estimate} />
          <NotesSection estimateId={estimateId} estimateNotes={estimateNotes} />
        </div>
        <div className='order-1 2xl:order-3 col-span-1 md:col-span-2 2xl:col-span-1 '>
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
      </div>
    </>
  )
}

export default EstimateDetails
