import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, MessageSquare, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'

const ProposalScope = ({
  openRevisionModal,
  setOpenRevisionModal,
  isFirst,
  isLast,
  onPrev,
  onNext,
  currentIndex,
  totalItems,
  hasReview,
  existingReview,
  isConverted,
  onApprove,
  isApproving
}: {
  openRevisionModal: boolean
  setOpenRevisionModal: React.Dispatch<React.SetStateAction<boolean>>
  isFirst: boolean
  isLast: boolean
  onPrev: () => void
  onNext: () => void
  currentIndex: number
  totalItems: number
  hasReview: boolean
  existingReview: string | null
  isConverted: boolean
  onApprove: () => Promise<void>
  isApproving: boolean
}) => {
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false)

  return (
    <>
      <div className='flex flex-col gap-4 mb-10'>
        <div className='flex flex-col gap-4'>
          <h3 className='text-lg font-semibold'>Scope of work:</h3>
          <ul className='list-disc list-outside ml-5 space-y-1 text-primary-foreground/80 print:text-black/80 text-sm'>
            <li>Grind the top layer off your concrete</li>
            <li>Degrease and prep the surface</li>
            <li>Perform normal preparation on the floor to fill cracks and imperfections</li>
            <li>Install industrial metallic coating with a urethane top layer</li>
            <li>Apply a polyaspartic top coat for premium protection</li>
          </ul>
        </div>

        <div className='flex flex-col gap-4'>
          <h3 className='text-lg font-semibold'>Notes:</h3>
          <ul className='list-disc list-outside ml-5 space-y-1 text-primary-foreground/80 print:text-black/80 text-sm'>
            <li>
              While we will fill the cracks, concrete moves over time. As a result, we cannot guarantee that future
              movement won't cause stress cracks.
            </li>
            <li>A 50% deposit is required to reserve a spot on our schedule.</li>
            <li>
              Once ready to proceed, click the &quot;Approve&quot; button, and we will contact you for scheduling.
            </li>
          </ul>
        </div>

        {/* Existing review banner — shown when this history item already has a review */}
        {hasReview && existingReview && (
          <div className='rounded-md border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm print:hidden'>
            <p className='font-semibold text-yellow-400 mb-1'>Your Revision Request</p>
            <p className='text-primary-foreground/80 whitespace-pre-wrap'>{existingReview}</p>
          </div>
        )}

        {/* Converted to invoice status banner */}
        {isConverted && (
          <div className='rounded-md border border-green-500/40 bg-green-500/10 p-4 text-sm print:hidden'>
            <p className='font-semibold text-green-400'>✓ Converted to Invoice</p>
            <p className='text-primary-foreground/60 mt-1'>
              This proposal has been approved and converted to an invoice.
            </p>
          </div>
        )}

        <div className='flex flex-col gap-4 sm:flex-row justify-between sm:items-center mt-4 print:hidden'>
          {/* Previous button — always reserve space so layout stays stable */}
          <Button
            variant='secondary'
            className='bg-border/50 hover:bg-border text-white px-6'
            onClick={onPrev}
            disabled={isFirst}
          >
            <ChevronLeft className='w-4 h-4 mr-2' />
            Previous
          </Button>

          {/* Step indicator */}
          <span className='text-sm text-primary-foreground/60 text-center'>
            {totalItems > 1
              ? isLast
                ? `Current Proposal (${currentIndex + 1} / ${totalItems})`
                : `Revision ${currentIndex + 1} of ${totalItems}`
              : 'Current Proposal'}
          </span>

          {/* Last item (current proposal): show action buttons only when no review exists  */}
          {isLast ? (
            hasReview || isConverted ? (
              <div className='flex flex-col sm:flex-row gap-4'>
                <Button
                  variant='secondary'
                  className='bg-border/50 hover:bg-border text-white px-6'
                  onClick={() => window.print()}
                >
                  <Printer className='w-4 h-4 mr-2' />
                  Print PDF
                </Button>
              </div>
            ) : (
              <div className='flex flex-col sm:flex-row gap-4'>
                <Button
                  variant='secondary'
                  className='bg-border/50 hover:bg-border text-white px-6'
                  onClick={() => window.print()}
                >
                  <Printer className='w-4 h-4 mr-2' />
                  Print PDF
                </Button>
                <Button variant='destructive' onClick={() => setOpenRevisionModal(true)}>
                  <MessageSquare className='w-4 h-4 mr-2' />
                  Review
                </Button>
                <Button variant='primary' onClick={() => setConfirmApproveOpen(true)} disabled={isApproving}>
                  <Check className='w-4 h-4 mr-2' />
                  Approve
                </Button>
              </div>
            )
          ) : (
            <>
              {/* Non-last item (history revision): show only Next  */}
              <Button variant='primary' onClick={onNext}>
                Next
                <ChevronRight className='w-4 h-4 ml-2' />
              </Button>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmApproveOpen}
        onOpenChange={setConfirmApproveOpen}
        title='Approve Proposal'
        message='Are you sure you want to approve this proposal? This will convert the proposal to an invoice and cannot be undone.'
        confirmButtonTitle='Approve'
        loading={isApproving}
        onConfirm={async () => {
          await onApprove()
          setConfirmApproveOpen(false)
        }}
      />
    </>
  )
}

export default ProposalScope
