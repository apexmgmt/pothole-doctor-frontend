'use client'

import BillingInformation from './BillingInformation'
import BillingItems from './BillingItems'
import ProposalBasicInfo from './ProposalBasicInfo'
import ProposalScope from './ProposalScope'
import { Separator } from '@/components/ui/separator'

const ProposalView = () => {
  return (
    <>
      {/* Proposal Basic Info */}
      <ProposalBasicInfo />
      <Separator className='mt-4' />
      {/* Billing Information */}
      <BillingInformation />
      {/* Billing Items */}
      <BillingItems />
      <Separator className='mb-8' />
      {/* Proposal Scope & Notes */}
      <ProposalScope />
    </>
  )
}

export default ProposalView
