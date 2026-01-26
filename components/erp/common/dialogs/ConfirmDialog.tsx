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

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
  title: string
  message: string
  cancelButtonTitle?: string
  confirmButtonTitle?: string
  onConfirm: (e?: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>
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
        <Button variant='outline' onClick={() => onOpenChange(false)} disabled={loading}>
          {cancelButtonTitle}
        </Button>
        <Button onClick={onConfirm} disabled={loading} {...confirmButtonProps}>
          {confirmButtonTitle}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export default ConfirmDialog
