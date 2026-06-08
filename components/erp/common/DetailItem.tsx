import { cn } from '@/lib/utils'
import React from 'react'

interface DetailItemProps {
  label: string
  value: React.ReactNode
  className?: string
  labelClassName?: string
  valueClassName?: string
}

const DetailItem: React.FC<DetailItemProps> = ({
  label,
  value,
  className = '',
  labelClassName = '',
  valueClassName = ''
}) => {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <label className={cn('text-xs text-muted-foreground uppercase min-w-25', labelClassName)}>{label} : </label>
      <div className={cn('text-light', valueClassName)}>{value}</div>
    </div>
  )
}

export default DetailItem
