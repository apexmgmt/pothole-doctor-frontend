import React from 'react'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/ui/alert-dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
  title: string
  message: string
  cancelButtonTitle?: string
  confirmButtonTitle?: string
  onConfirm: () => void | Promise<void>
  confirmButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
  loading?: boolean
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
  loading = false
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{message}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => onOpenChange(false)}>{cancelButtonTitle}</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} disabled={loading} {...confirmButtonProps}>
          {confirmButtonTitle}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export default ConfirmDialog
