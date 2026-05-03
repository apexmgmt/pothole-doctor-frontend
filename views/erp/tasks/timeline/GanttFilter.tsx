'use client'

import { useState } from 'react'
import { format, addDays, startOfDay } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

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

  const [popoverOpen, setPopoverOpen] = useState(false)

  const handleApply = () => {
    if (!dateRange?.from) return
    setPopoverOpen(false)
    onApply({
      starting_date: format(dateRange.from, 'yyyy-MM-dd'),
      ending_date: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
    })
  }

  const handleClear = () => {
    const from = addDays(startOfDay(new Date()), -15)
    const to = addDays(startOfDay(new Date()), 15)

    setDateRange({ from, to })
    onClear()
  }

  return (
    <div className='flex items-center gap-2'>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'justify-start text-left font-normal min-w-60 border-zinc-700 bg-zinc-900 hover:bg-zinc-800',
              !dateRange?.from && 'text-zinc-500'
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4 shrink-0' />
            {dateRange?.from ? (
              dateRange.to ? (
                <span className='text-zinc-200'>
                  {format(dateRange.from, 'MMM d, yyyy')} – {format(dateRange.to, 'MMM d, yyyy')}
                </span>
              ) : (
                <span className='text-zinc-200'>{format(dateRange.from, 'MMM d, yyyy')}</span>
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
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant='default'
        size='default'
        onClick={handleApply}
        disabled={!dateRange?.from}
        className='bg-white text-black hover:bg-zinc-200'
      >
        Apply
      </Button>

      {hasActiveFilter && (
        <Button
          variant='ghost'
          size='default'
          onClick={handleClear}
          className='text-zinc-400 hover:text-zinc-200 border border-zinc-700'
        >
          Clear
        </Button>
      )}
    </div>
  )
}
