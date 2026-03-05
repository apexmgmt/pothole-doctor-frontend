import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { Invoice } from '@/types'

const InvoiceActions = ({ invoice }: { invoice: Invoice }) => {
  return (
    <div className='flex flex-col gap-4 mb-10'>
      <div className='flex flex-col sm:flex-row justify-end sm:items-center mt-4 print:hidden'>
        <Button
          variant='secondary'
          className='bg-border/50 hover:bg-border text-white px-6'
          onClick={() => window.print()}
        >
          <Printer className='w-4 h-4 mr-2' />
          Print PDF
        </Button>
      </div>
    </div>
  )
}

export default InvoiceActions
