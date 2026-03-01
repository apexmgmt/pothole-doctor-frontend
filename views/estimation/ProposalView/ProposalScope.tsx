import React from 'react'
import { Button } from '@/components/ui/button'
import { Printer, MessageSquare, Check, ChevronLeft, ChevronRight } from 'lucide-react'

const ProposalScope = ({
  openRevisionModal,
  setOpenRevisionModal,
  isFirst,
  isLast,
  onPrev,
  onNext,
  currentIndex,
  totalItems
}: {
  openRevisionModal: boolean
  setOpenRevisionModal: React.Dispatch<React.SetStateAction<boolean>>
  isFirst: boolean
  isLast: boolean
  onPrev: () => void
  onNext: () => void
  currentIndex: number
  totalItems: number
}) => {
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

          {isLast ? (

            /* Last item (current proposal): show Print, Review, Approve */
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
              <Button variant='primary'>
                <Check className='w-4 h-4 mr-2' />
                Approve
              </Button>
            </div>
          ) : (

            /* Non-last item (history revision): show only Next */
            <Button variant='primary' onClick={onNext}>
              Next
              <ChevronRight className='w-4 h-4 ml-2' />
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

export default ProposalScope
