import { Button } from '@/components/ui/button'
import { Printer, Send } from 'lucide-react'

const InvoiceActions = ({
  canSubmit,
  isSubmitting,
  showSubmit,
  onSubmit
}: {
  canSubmit: boolean
  isSubmitting: boolean
  showSubmit: boolean
  onSubmit: () => void
}) => {
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

export default InvoiceActions
