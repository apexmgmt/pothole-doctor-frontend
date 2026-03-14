import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Invoice } from '@/types'
import { ChevronDownIcon } from 'lucide-react'

const InvoiceActionsButton = ({
  invoice,
  isMarkingAsSigned,
  onViewEditDetails,
  onMarkAsSigned
}: {
  invoice: Invoice
  isMarkingAsSigned: boolean
  onViewEditDetails: () => void
  onMarkAsSigned: () => void
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type='button' variant='outline' size='default'>
          Invoice Actions
          <ChevronDownIcon className='h-4 w-4 ml-2' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={onViewEditDetails}>View/Edit Invoice Details</DropdownMenuItem>
        {invoice.status?.toLowerCase() === 'new' && (
          <DropdownMenuItem onClick={onMarkAsSigned} disabled={isMarkingAsSigned}>
            {isMarkingAsSigned ? 'Marking...' : 'Mark Invoice as Signed'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default InvoiceActionsButton
