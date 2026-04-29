'use client'

import React, { useState } from 'react'
import { addMonths, format, isAfter } from 'date-fns'
import { Calendar as CalendarIcon, X, AlertCircle } from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'

interface KanbanFilterProps {
  onChange: (filters: { starting_date?: string; ending_date?: string }) => void
  initialFilters?: { starting_date?: string; ending_date?: string }
}

const KanbanFilter: React.FC<KanbanFilterProps> = ({ onChange, initialFilters }) => {
  // 1. Initialize range state from initial filters
  const [date, setDate] = useState<DateRange | undefined>({
    from: initialFilters?.starting_date ? new Date(initialFilters.starting_date) : undefined,
    to: initialFilters?.ending_date ? new Date(initialFilters.ending_date) : undefined
  })

  const formatDateToString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  // 2. Validation Logic for the 6-month constraint
  const validateRange = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) return { valid: true }

    const sixMonthsFromStart = addMonths(range.from, 6)

    if (isAfter(range.to, sixMonthsFromStart)) {
      return { valid: false, message: 'Date range cannot exceed 6 months' }
    }

    return { valid: true }
  }

  const { valid, message } = validateRange(date)

  const handleApply = () => {
    if (!valid) {
      toast.error(message)

      return
    }

    // Pass formatted strings back to KanbanBoard[cite: 2]
    onChange({
      starting_date: date?.from ? formatDateToString(date.from) : undefined,
      ending_date: date?.to ? formatDateToString(date.to) : undefined
    })
  }

  const handleClear = () => {
    setDate(undefined)
    onChange({
      starting_date: undefined,
      ending_date: undefined
    })
  }

  return (
    <div className='flex flex-col mb-4'>
      <div className='flex gap-2 items-end'>
        <div className='grid gap-1'>
          <label className='text-xs font-medium'>Task Date Range</label>
          <div className={cn('grid gap-2', !valid && 'border-destructive')}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id='date'
                  variant={'outline'}
                  className={cn(
                    'w-[300px] justify-start text-left font-normal',
                    !date && 'text-muted-foreground',
                    !valid && 'border-destructive text-destructive'
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(date.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  initialFocus
                  mode='range'
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2} // Shows two calendars side-by-side
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className='flex gap-2'>
          <Button type='button' onClick={handleApply} disabled={!valid || !date?.from || !date?.to} size='default'>
            Apply
          </Button>

          {(date?.from || date?.to) && (
            <Button type='button' variant='outline' onClick={handleClear} size='default'>
              <X className='h-4 w-4 mr-1' /> Clear
            </Button>
          )}
        </div>
      </div>

      {!valid && (
        <p className='text-destructive text-xs mt-2 flex items-center gap-1'>
          <AlertCircle className='h-3 w-3' /> {message}
        </p>
      )}
    </div>
  )
}

export default KanbanFilter
