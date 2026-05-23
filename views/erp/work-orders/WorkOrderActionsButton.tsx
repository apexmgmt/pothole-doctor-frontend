import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { WorkOrder } from '@/types'
import { ChevronDownIcon, Eye } from 'lucide-react'

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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default WorkOrderActionsButton
