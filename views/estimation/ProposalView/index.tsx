'use client'

import BillingInformation from './BillingInformation'
import BillingItems from './BillingItems'
import ProposalBasicInfo from './ProposalBasicInfo'
import ProposalScope from './ProposalScope'
import { Separator } from '@/components/ui/separator'
import ProposalRevisionModal from './ProposalRevisionModal'
import { useState } from 'react'
import { Proposal } from '@/types'

const ProposalView = ({proposal}: {proposal: Proposal}) => {
  const [openRevisionModal, setOpenRevisionModal] = useState<boolean>(false)

  return (
    <>
      {/* Proposal Basic Info */}
      <ProposalBasicInfo proposal={proposal} />
      <Separator className='mt-4' />
      {/* Billing Information */}
      <BillingInformation proposal={proposal} />
      {/* Billing Items */}
      <BillingItems proposal={proposal} />
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
