import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { Trash2Icon } from 'lucide-react'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'

type DeleteButtonProps = {
  title?: string
  onClick: () => void | Promise<void>
  variant?: 'icon' | 'text'
  buttonSize?: 'icon' | 'default'
  buttonVariant?: 'outline' | 'ghost' | 'destructive'
  tooltip?: string
  confirmTitle?: string
  confirmMessage?: string
  loading?: boolean
}

export default function DeleteButton({
  title = 'Delete',
  onClick,
  variant = 'icon',
  buttonSize = 'icon',
  buttonVariant = 'destructive',
  tooltip = '',
  confirmTitle = 'Confirm Deletion',
  confirmMessage = 'Are you sure you want to delete this item? This action cannot be undone.',
  loading = false
}: DeleteButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleConfirm = async () => {
    await onClick()
    setIsDialogOpen(false)
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={buttonVariant}
              size={buttonSize}
              onClick={() => setIsDialogOpen(true)}
              type='button'
              aria-label={title}
              disabled={loading}
            >
              {variant === 'icon' ? <Trash2Icon className='h-6 w-6' /> : <span>{title}</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top' align='center'>
            {tooltip || title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmButtonTitle='Delete'
        cancelButtonTitle='Cancel'
        onConfirm={handleConfirm}
        loading={loading}
        confirmButtonProps={{ className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' }}
      />
    </>
  )
}
