'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'
import { MaterialJobAction } from '@/types'
import MaterialJobService from '@/services/api/products/material-jobs.service'

interface MaterialJobActionsRowProps {
  actions: MaterialJobAction[]
  onActionsChange: (actions: MaterialJobAction[]) => void
}

/**
 * Renders a sub-row beneath a line item showing all material job actions as badges.
 * Only the latest action (index 0, newest first) can be deleted.
 * Deletion calls the API and updates the parent via onActionsChange.
 * When all actions are deleted the parent row becomes editable again.
 */
const getStatusVariant = (
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'info' | 'success' | 'pending' => {
  switch (status?.toLowerCase()) {
    case 'allocated':
      return 'secondary'
    case 'partially_prepared':
    case 'prepared':
      return 'pending'
    case 'pending':
      return 'pending'
    case 'received':
    case 'partially_received':
      return 'info'
    case 'shipped':
    case 'shipped_from_vendor':
      return 'warning'
    default:
      return 'outline'
  }
}

const MaterialJobActionsRow = ({ actions, onActionsChange }: MaterialJobActionsRowProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Latest action is first in the array (newest first)
  const latestAction = actions[0]

  const handleDelete = async () => {
    if (!latestAction) return

    setIsDeleting(true)

    try {
      await MaterialJobService.destroyAction(latestAction.material_job_id, latestAction.id)
      toast.success('Action deleted')
      onActionsChange(actions.slice(1))
    } catch {
      toast.error('Failed to delete action')
    } finally {
      setIsDeleting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <>
      <tr className='bg-zinc-950 border-b border-zinc-800'>
        <td colSpan={15} className='p-2'>
          <div className='flex flex-wrap items-center gap-1'>
            {actions.map((action, aIdx) => {
              const initials = action.employee
                ? `${action.employee.first_name?.[0] ?? ''}${action.employee.last_name?.[0] ?? ''}`.toUpperCase()
                : ''

              const unitName = action.quantity_unit?.name ?? action.sale_unit?.name ?? ''

              const dateStr = action.action_date
                ? new Date(action.action_date).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: '2-digit'
                  })
                : ''

              const isLatest = aIdx === 0

              return (
                <div key={action.id} className='flex items-center gap-0.5'>
                  <Badge variant={getStatusVariant(action.action_status)} className='text-xs capitalize'>
                    {action.action_status} ({action.quantity} {unitName}){initials && ` - ${initials}`}
                    {dateStr && ` - ${dateStr}`}
                  </Badge>
                  {isLatest && (
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-5 w-5 text-destructive hover:text-destructive'
                      onClick={() => setConfirmOpen(true)}
                      title='Delete latest action'
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </td>
      </tr>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title='Delete Action'
        message='Are you sure you want to delete this action? This cannot be undone. The latest action must be deleted first.'
        confirmButtonTitle='Delete'
        confirmButtonProps={{ className: 'bg-destructive hover:bg-destructive/90 text-white' }}
        loading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default MaterialJobActionsRow
