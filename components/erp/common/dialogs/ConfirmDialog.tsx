import React from 'react'

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription
} from '@/components/ui/alert-dialog'

import { Button } from '@/components/ui/button'
import { SpinnerCustom } from '@/components/ui/spinner'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
  title: string
  message: React.ReactNode
  cancelButtonTitle?: string
  confirmButtonTitle?: string
  onConfirm: (e?: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>
  confirmButtonProps?: React.ComponentProps<typeof Button>
  loading?: boolean
  className?: string
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  trigger,
  title,
  message,
  cancelButtonTitle = 'Cancel',
  confirmButtonTitle = 'Confirm',
  onConfirm,
  confirmButtonProps,
  loading = false,
  className
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
    <AlertDialogContent className={className}>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {typeof message === 'string' ? (
          <AlertDialogDescription>{message}</AlertDialogDescription>
        ) : (
          <div className='text-sm text-muted-foreground mt-2'>{message}</div>
        )}
      </AlertDialogHeader>
      <AlertDialogFooter>
        <Button variant='outline' onClick={() => onOpenChange(false)} disabled={loading}>
          {cancelButtonTitle}
        </Button>
        <Button onClick={onConfirm} disabled={loading} {...confirmButtonProps}>
          <div className='flex items-center justify-center gap-4'>
            {confirmButtonTitle}
            {loading && (
              <div className='relative '>
                <SpinnerCustom size='size-4' />
              </div>
            )}
          </div>
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export default ConfirmDialog
