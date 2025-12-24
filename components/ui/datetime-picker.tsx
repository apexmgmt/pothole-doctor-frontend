'use client'

import * as React from 'react'

import { CalendarIcon } from 'lucide-react'

import DatePicker from 'react-datepicker'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

import 'react-datepicker/dist/react-datepicker.css'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
  value: number | null
  onChange: (timestamp: number | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick date & time',
  className,
  disabled = false
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const dateValue = value ? new Date(value) : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full bg-muted justify-start text-left font-normal h-10 px-3 py-2',
            !value && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {dateValue ? dateValue.toLocaleString() : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <DatePicker
          selected={dateValue}
          onChange={date => onChange(date ? date.getTime() : null)}
          showTimeSelect
          timeIntervals={15}
          dateFormat='Pp'
          className='w-full'
          inline
        />
      </PopoverContent>
    </Popover>
  )
}
