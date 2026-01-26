import { useState } from 'react'

import { Trash2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'
import { toast } from 'sonner'

type DeleteButtonProps = {
  title?: string
  onClick: (e?: React.MouseEvent) => void | Promise<void>
  variant?: 'icon' | 'text'
  buttonSize?: 'icon' | 'default'
  buttonVariant?: 'outline' | 'ghost' | 'destructive'
  tooltip?: string
  confirmTitle?: string
  confirmMessage?: string
  loading?: boolean
  disabled?: boolean
}

export default function DeleteButton({
  title = 'Delete',
  onClick,
  variant = 'icon',
  buttonSize = 'icon',
  buttonVariant = 'ghost',
  tooltip = '',
  confirmTitle = 'Confirm Deletion',
  confirmMessage = 'Are you sure you want to delete this item? This action cannot be undone.',
  loading = false,
  disabled = false
}: DeleteButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(loading)

  const handleConfirm = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    setIsLoading(true)

    try {
      await onClick(e)
      setIsDialogOpen(false)
    } catch (error) {
      toast.error('Something went wrong while deleting. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
              disabled={loading || disabled}
              className={`hover:text-destructive ${variant !== 'icon' ? 'w-full' : ''}`}
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
        loading={isLoading}
        confirmButtonProps={{ className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' }}
      />
    </>
  )
}
