'use client'

import * as React from 'react'
import { useEffect, useRef } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { SpinnerCustom } from '@/components/ui/spinner'

interface CommonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  isLoading?: boolean
  loadingMessage?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
  contentClassName?: string
  disableClose?: boolean
}

const maxWidthClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  full: 'sm:max-w-full'
}

const CommonDialog = ({
  open,
  onOpenChange,
  title,
  description,
  isLoading = false,
  loadingMessage = 'Loading...',
  maxWidth = 'md',
  children,
  actions,
  className,
  contentClassName,
  disableClose = false
}: CommonDialogProps) => {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoading && contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [isLoading])

  const handleOpenChange = (newOpen: boolean) => {
    if (!disableClose) {
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(maxWidthClasses[maxWidth], className)}
        onInteractOutside={e => {
          if (disableClose) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={e => {
          if (disableClose) {
            e.preventDefault()
          }
        }}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}

        <div
          ref={contentRef}
          className={cn(
            'relative max-h-[60vh] overflow-y-auto',
            isLoading && 'pointer-events-none opacity-50',
            contentClassName
          )}
        >
          {isLoading && (
            <div className='absolute inset-0 backdrop-blur-xs flex items-center justify-center'>
              <SpinnerCustom size='size-8' />
            </div>
          )}
          {children}
        </div>

        {actions && <DialogFooter>{actions}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}

export default CommonDialog
