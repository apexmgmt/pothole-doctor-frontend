'use client'

import BillingInformation from './BillingInformation'
import BillingItems from './BillingItems'
import ProposalBasicInfo from './ProposalBasicInfo'
import ProposalScope from './ProposalScope'
import { Separator } from '@/components/ui/separator'
import ProposalRevisionModal from './ProposalRevisionModal'
import { useState, useMemo } from 'react'
import { Proposal, ProposalHistory } from '@/types'
import { useRouter, useSearchParams } from 'next/navigation'

const ProposalView = ({
  proposal,
  proposalHistories
}: {
  proposal: Proposal
  proposalHistories: ProposalHistory[]
}) => {
  const [openRevisionModal, setOpenRevisionModal] = useState<boolean>(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Hash IDs from URL — needed for reviewProposal API
  const proposalHashId = searchParams.get('p_id') ?? ''
  const clientHashId = searchParams.get('qc_id') ?? ''

  // Build ordered items: histories sorted oldest→newest; the last history's proposal_data
  // IS the current proposal, so no need to append proposal separately.
  // If no histories, fall back to [proposal] so there is always exactly one step.
  const items = useMemo(() => {
    if (proposalHistories.length === 0) return [proposal]

    return proposalHistories.map(h => h.proposal_data)
  }, [proposalHistories, proposal])

  // Initialise from query param so refreshing restores the same step
  const rawIndex = parseInt(searchParams.get('h') ?? '', 10)
  const initialIndex = Math.min(Math.max(isNaN(rawIndex) ? 0 : rawIndex, 0), items.length - 1)

  // State drives instant rendering; query param stays in sync for refresh/sharing
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex)

  const isFirst = currentIndex === 0
  const isLast = currentIndex === items.length - 1
  const displayProposal = items[currentIndex]

  // Current history entry (undefined when no histories)
  const currentHistory = proposalHistories[currentIndex] ?? null
  const hasReview = !!currentHistory?.review
  const existingReview = currentHistory?.review ?? null

  const navigate = (index: number) => {
    setCurrentIndex(index)

    // Keep URL in sync without triggering a navigation/re-render from the router
    const params = new URLSearchParams(searchParams.toString())

    params.set('h', String(index))
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handlePrev = () => navigate(currentIndex - 1)
  const handleNext = () => navigate(currentIndex + 1)

  return (
    <>
      {/* Proposal Basic Info */}
      <ProposalBasicInfo proposal={displayProposal} />
      <Separator className='mt-4' />
      {/* Billing Information */}
      <BillingInformation proposal={displayProposal} />
      {/* Billing Items */}
      <BillingItems proposal={displayProposal} />
      <Separator className='mb-4' />
      {/* Proposal Scope & Notes */}
      <ProposalScope
        openRevisionModal={openRevisionModal}
        setOpenRevisionModal={setOpenRevisionModal}
        isFirst={isFirst}
        isLast={isLast}
        onPrev={handlePrev}
        onNext={handleNext}
        currentIndex={currentIndex}
        totalItems={items.length}
        hasReview={hasReview}
        existingReview={existingReview}
      />
      {/* Proposal Revision Modal */}
      {openRevisionModal && (
        <ProposalRevisionModal
          isOpen={openRevisionModal}
          onOpenChange={setOpenRevisionModal}
          proposalHashId={proposalHashId}
          clientHashId={clientHashId}
          onSuccess={() => {
            router.refresh()
          }}
        />
      )}
    </>
  )
}

export default ProposalView
