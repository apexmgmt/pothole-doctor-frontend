import { useEffect, useState } from 'react'
import { Controller, FieldValues, Path } from 'react-hook-form'

import { CalendarDays } from 'lucide-react'

import { formatDate, normalizeDate, parseLocalDate } from '@/utils/formatTime'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { FieldComponentProps } from './types'
import { format } from 'date-fns'

type DatePickerProps<T extends FieldValues> = Omit<FieldComponentProps<T>, 'register'> & {
  minDate?: string
  maxDate?: string
  lockFutureDate?: boolean
}

const DatePicker = <T extends FieldValues>({
  name,
  placeholder,
  control,
  rules,
  minDate,
  maxDate,
  lockFutureDate,
  value,
  onChange,
  onBlur,
  autoFocus,
  disabled = false,
  className = ''
}: DatePickerProps<T>) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (autoFocus && !disabled) {
      setOpen(true)
    }
  }, [autoFocus, disabled])

  const renderDatePicker = (currentValue: string | undefined, setCurrentValue: (nextValue: string) => void) => (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          onClick={e => e.stopPropagation()}
          autoFocus={autoFocus}
          className={`w-full text-sm justify-between p-2.5! pe-1.5! py-1.5! ${currentValue ? 'text-[#f4f4f5]' : 'text-[#a7a7ae]!'} ${className}`}
        >
          {currentValue ? format(new Date(currentValue), 'MM/dd/yyyy') : placeholder}
          <CalendarDays className='size-4' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={parseLocalDate(currentValue ?? '') || undefined}
          disabled={date => {
            const current = normalizeDate(date)

            const todayDisabled = lockFutureDate && current > normalizeDate(new Date())

            const minDisabled = minDate ? current < normalizeDate(new Date(minDate)) : false

            const maxDisabled = maxDate ? current > normalizeDate(new Date(maxDate)) : false

            return todayDisabled || minDisabled || maxDisabled
          }}
          onSelect={date => {
            if (!date) return

            const formattedDate = formatDate(date)

            setCurrentValue(formattedDate)
            onBlur?.(formattedDate)
            setOpen(false)
          }}
          className='rounded-md'
        />
      </PopoverContent>
    </Popover>
  )

  if (!control || !name) {
    return renderDatePicker(String(value ?? '') || undefined, nextValue => {
      onChange?.(nextValue)
    })
  }

  return (
    <Controller
      name={name as Path<T>}
      control={control}
      rules={rules}
      render={({ field }) => {
        return renderDatePicker(String(field.value ?? value ?? '') || undefined, nextValue => {
          field.onChange(nextValue)
          onChange?.(nextValue)
        })
      }}
    />
  )
}

export default DatePicker
