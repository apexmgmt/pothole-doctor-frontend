'use client'

import * as React from 'react'
import { ClockIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popoverContent'
import { cn } from '@/lib/utils'
import ReactTimePicker from 'react-time-picker'
import 'react-time-picker/dist/TimePicker.css'

interface TimePickerProps {
  value: string | null
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  [key: string]: any
}

export function TimePicker({
  value,
  onChange,
  placeholder = 'Pick a time',
  className,
  disabled = false,
  ...props
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal h-10 px-3 py-2 bg-bg-3 border border-border text-light hover:bg-bg-4 hover:text-light focus:ring',
            !value && 'text-gray-400',
            className
          )}
          disabled={disabled}
          onClick={() => setOpen(true)}
          {...props}
        >
          <ClockIcon className='mr-2 h-4 w-4' />
          {value ? <span>{value}</span> : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto p-2 bg-bg-2 border border-border shadow-md flex items-center'
        align='start'
        side='bottom'
        sideOffset={2}
      >
        <ReactTimePicker
          value={value || ''}
          onChange={val => {
            onChange(val as string)
            setOpen(false)
          }}
          disableClock={true}
          clearIcon={null}
          format='HH:mm'
          className='w-full'
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  )
}
