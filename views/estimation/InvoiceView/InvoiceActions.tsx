import { Button } from '@/components/ui/button'
import { Printer, Send, ChevronLeft, ChevronRight } from 'lucide-react'

const InvoiceActions = ({
  canSubmit,
  isSubmitting,
  showSubmit,
  onSubmit,
  isFirst,
  isLast,
  onPrev,
  onNext,
  currentIndex,
  totalItems
}: {
  canSubmit: boolean
  isSubmitting: boolean
  showSubmit: boolean
  onSubmit: () => void
  isFirst: boolean
  isLast: boolean
  onPrev: () => void
  onNext: () => void
  currentIndex: number
  totalItems: number
}) => {
  if (totalItems <= 1) {
    // Single version — keep the original simple layout
    return (
      <div className='flex flex-col gap-4 mb-10 print:hidden'>
        <div className='flex flex-col sm:flex-row justify-end sm:items-center mt-4 gap-3'>
          <Button
            variant='secondary'
            className='bg-border/50 hover:bg-border text-white px-6'
            onClick={() => window.print()}
          >
            <Printer className='w-4 h-4 mr-2' />
            Print PDF
          </Button>
          {showSubmit && (
            <Button variant='primary' className='px-6' onClick={onSubmit} disabled={!canSubmit || isSubmitting}>
              <Send className='w-4 h-4 mr-2' />
              {isSubmitting ? 'Submitting...' : 'Submit Invoice'}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4 mb-10 print:hidden'>
      <div className='flex flex-col sm:flex-row justify-between sm:items-center mt-4 gap-3'>
        {/* Previous button */}
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
          {isLast
            ? `Current Invoice (${currentIndex + 1} / ${totalItems})`
            : `Version ${currentIndex + 1} of ${totalItems}`}
        </span>

        {/* Right side actions */}
        {isLast ? (
          <div className='flex flex-col sm:flex-row gap-3'>
            <Button
              variant='secondary'
              className='bg-border/50 hover:bg-border text-white px-6'
              onClick={() => window.print()}
            >
              <Printer className='w-4 h-4 mr-2' />
              Print PDF
            </Button>
            {showSubmit && (
              <Button variant='primary' className='px-6' onClick={onSubmit} disabled={!canSubmit || isSubmitting}>
                <Send className='w-4 h-4 mr-2' />
                {isSubmitting ? 'Submitting...' : 'Submit Invoice'}
              </Button>
            )}
          </div>
        ) : (
          <Button variant='primary' onClick={onNext}>
            Next
            <ChevronRight className='w-4 h-4 ml-2' />
          </Button>
        )}
      </div>
    </div>
  )
}

export default InvoiceActions
