import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DocumentIcon } from '@/public/icons'
import { WorkOrder } from '@/types'
import { ChevronDownIcon, Eye } from 'lucide-react'
import Link from 'next/link'

const WorkOrderActionsButton = ({
  workOrder,
  onViewEditDetails
}: {
  workOrder: WorkOrder
  onViewEditDetails: () => void
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type='button' variant='outline' size='default'>
          Work Order Actions
          <ChevronDownIcon className='h-4 w-4 ml-2' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        <DropdownMenuItem onClick={onViewEditDetails}>
          <Eye className='mr-2 h-4 w-4' />
          View/Edit Work Order Details
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/erp/invoices/${workOrder?.invoice_id}`} prefetch={false} target='_blank'>
            <DocumentIcon className='mr-2 h-4 w-4' />
            View Invoice
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default WorkOrderActionsButton
