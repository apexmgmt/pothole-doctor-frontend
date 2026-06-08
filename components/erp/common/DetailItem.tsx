import { cn } from '@/lib/utils'
import React from 'react'

interface DetailItemProps {
  label: string
  value: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  className?: string
  labelClassName?: string
  valueClassName?: string
}

const DetailItem: React.FC<DetailItemProps> = ({
  label,
  value,
  icon: Icon,
  className = '',
  labelClassName = '',
  valueClassName = ''
}) => {
  return (
    <div className={cn('grid grid-cols-[148px_minmax(0,_1fr)] gap-2', className)}>
      <div className='flex items-center gap-1.5'>
        {Icon && <Icon className='size-4.5 text-muted-foreground shrink-0' />}
        <label className={cn('text-xs font-medium leading-none text-muted-foreground', labelClassName)}>
          {label}:
        </label>
      </div>
      <div className={cn('text-xs text-light min-w-0', valueClassName)}>
        {value}
      </div>
    </div>
  )
}

export default DetailItem

