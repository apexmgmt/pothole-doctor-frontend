'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { DateRange as ReactDayPickerDateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popoverContent'

interface DatePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  [key: string]: any
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  disabled = false,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal h-10 px-3 py-2 bg-bg-3 border border-border text-light hover:bg-bg-4 hover:text-light focus:ring',
            !value && 'text-gray-400',
            className
          )}
          disabled={disabled}
          {...props}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {value ? format(value, 'MM/dd/yyyy') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto p-0 bg-bg-2 border border-border shadow-md'
        align='start'
        side='bottom'
        sideOffset={2}
      >
        <Calendar
          mode='single'
          selected={value ?? undefined}
          onSelect={handleSelect}
          initialFocus
          className='bg-bg-2 text-light border-none overflow-hidden w-[250px]'
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateRangePickerProps {
  value: ReactDayPickerDateRange | null
  onChange: (range: ReactDayPickerDateRange | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  [key: string]: any
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Pick a date range',
  className,
  disabled = false,
  ...props
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (range: ReactDayPickerDateRange | undefined) => {
    if (range) {
      onChange(range)
      // Only close if both from and to are selected
      if (range.from && range.to) {
        setOpen(false)
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal h-10 px-3 py-2 bg-bg-3 border border-border text-light hover:bg-bg-4 hover:text-light focus:ring focus:ring-offset-1',
            !value?.from && 'text-gray-400',
            className
          )}
          disabled={disabled}
          {...props}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, 'MM/dd/yyyy')} - {format(value.to, 'MM/dd/yyyy')}
              </>
            ) : (
              format(value.from, 'MM/dd/yyyy')
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0 bg-bg-2 border border-border shadow-md'>
        <Calendar
          mode='range'
          selected={value ?? undefined}
          onSelect={handleSelect}
          initialFocus
          className='bg-bg-2 text-light border-0'
        />
      </PopoverContent>
    </Popover>
  )
}
