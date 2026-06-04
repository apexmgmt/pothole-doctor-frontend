'use client'

import React, { useState } from 'react'
import { addMonths, isAfter } from 'date-fns'
import { X, AlertCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DateRangePicker, type DateRange } from '@/components/ui/date-range-picker'
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
            <DateRangePicker
              placeholder='Select date range'
              value={date}
              onChange={newRange => {
                const validation = validateRange(newRange)

                if (!validation.valid) {
                  toast.error(validation.message)

                  return
                }

                setDate(newRange)
                onChange({
                  starting_date: newRange?.from ? formatDateToString(newRange.from) : undefined,
                  ending_date: newRange?.to ? formatDateToString(newRange.to) : undefined
                })
              }}
              className={cn(
                'w-[300px]',
                !date && 'text-muted-foreground',
                !valid && 'border-destructive text-destructive'
              )}
            />
          </div>
        </div>

        <div className='flex gap-2'>
          {(date?.from || date?.to) && (
            <Button type='button' variant='outline' onClick={handleClear} size='sm' className='h-7 py-1.5'>
              <X className='size-3 mr-1' /> Clear
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
