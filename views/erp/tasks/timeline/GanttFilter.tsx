'use client'

import { useState } from 'react'
import { addDays, startOfDay, format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { DateRangePicker, type DateRange } from '@/components/ui/date-range-picker'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface GanttFilterProps {
  initialFilters?: { starting_date?: string; ending_date?: string }
  hasActiveFilter?: boolean
  onApply: (filters: { starting_date?: string; ending_date?: string }) => void
  onClear: () => void
}

export default function GanttFilter({ initialFilters, hasActiveFilter, onApply, onClear }: GanttFilterProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: initialFilters?.starting_date ? new Date(initialFilters.starting_date) : undefined,
    to: initialFilters?.ending_date ? new Date(initialFilters.ending_date) : undefined
  })

  const handleClear = () => {
    const from = addDays(startOfDay(new Date()), -15)
    const to = addDays(startOfDay(new Date()), 15)

    setDateRange({ from, to })
    onClear()
  }

  return (
    <div className='flex items-center gap-2 flex-wrap'>
      <DateRangePicker
        placeholder='Select date range'
        value={dateRange}
        onChange={newRange => {
          setDateRange(newRange)

          if (newRange?.from) {
            onApply({
              starting_date: format(newRange.from, 'yyyy-MM-dd'),
              ending_date: newRange.to ? format(newRange.to, 'yyyy-MM-dd') : undefined
            })
          }
        }}
        showPresets={false}
        align='start'
        className={cn('min-w-60 border-zinc-700 bg-zinc-900 hover:bg-zinc-800', !dateRange?.from && 'text-zinc-500')}
      />

      {hasActiveFilter && (
        <Button variant='outline' onClick={handleClear} size='sm' className='h-7 py-1.5'>
          <X className='size-3 mr-1' /> Clear
        </Button>
      )}
    </div>
  )
}
