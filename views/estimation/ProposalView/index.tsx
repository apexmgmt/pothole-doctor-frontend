'use client'

import BillingInformation from './BillingInformation'
import BillingItems from './BillingItems'
import ProposalBasicInfo from './ProposalBasicInfo'
import ProposalScope from './ProposalScope'
import { Separator } from '@/components/ui/separator'
import ProposalRevisionModal from './ProposalRevisionModal'
import { useState } from 'react'

const ProposalView = () => {
  const [openRevisionModal, setOpenRevisionModal] = useState<boolean>(false)

  return (
    <>
      {/* Proposal Basic Info */}
      <ProposalBasicInfo />
      <Separator className='mt-4' />
      {/* Billing Information */}
      <BillingInformation />
      {/* Billing Items */}
      <BillingItems />
      <Separator className='mb-4' />
      {/* Proposal Scope & Notes */}
      <ProposalScope openRevisionModal={openRevisionModal} setOpenRevisionModal={setOpenRevisionModal} />
      {/* Proposal Revision Modal */}
      {openRevisionModal && (
        <ProposalRevisionModal
          isOpen={openRevisionModal}
          onOpenChange={setOpenRevisionModal}
          proposalId='some-proposal-id' // Replace with actual proposal ID
          onSuccess={() => {
            // Handle success (e.g., refresh data)
          }}
        />
      )}
    </>
  )
}

export default ProposalView
