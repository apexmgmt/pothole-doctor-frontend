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
import { ScrollArea } from '@/components/ui/scroll-area'

interface CommonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  isLoading?: boolean
  loadingMessage?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
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
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
  '6xl': 'sm:max-w-6xl',
  '7xl': 'sm:max-w-7xl',
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
  disableClose = true
}: CommonDialogProps) => {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoading && contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [isLoading])

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
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

        <ScrollArea
          className={cn('relative max-h-[80vh] p-1', isLoading && 'pointer-events-none opacity-50', contentClassName)}
          ref={contentRef}
        >
          {isLoading && (
            <div className='absolute inset-0 backdrop-blur-xs flex items-center justify-center z-10'>
              <SpinnerCustom size='size-8' />
            </div>
          )}
          {children}
        </ScrollArea>

        {actions && <DialogFooter>{actions}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}

export default CommonDialog
