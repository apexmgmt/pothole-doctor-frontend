'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, ChevronDown } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type DateRange = {
  from: Date | undefined
  to?: Date | undefined
}

export const DEFAULT_PRESETS = [
  {
    label: 'Today',
    range: () => {
      const d = new Date()

      d.setHours(0, 0, 0, 0)

      return { from: d, to: d }
    }
  },
  {
    label: 'Last 7 Days',
    range: () => {
      const to = new Date()

      to.setHours(0, 0, 0, 0)
      const from = new Date(to)

      from.setDate(from.getDate() - 6)

      return { from, to }
    }
  },
  {
    label: 'Current Month',
    range: () => {
      const n = new Date()

      return { from: new Date(n.getFullYear(), n.getMonth(), 1), to: new Date(n.getFullYear(), n.getMonth() + 1, 0) }
    }
  },
  {
    label: 'Previous Month',
    range: () => {
      const n = new Date()

      return { from: new Date(n.getFullYear(), n.getMonth() - 1, 1), to: new Date(n.getFullYear(), n.getMonth(), 0) }
    }
  },
  {
    label: 'First Quarter',
    range: () => {
      const y = new Date().getFullYear()

      return { from: new Date(y, 0, 1), to: new Date(y, 2, 31) }
    }
  },
  {
    label: 'Second Quarter',
    range: () => {
      const y = new Date().getFullYear()

      return { from: new Date(y, 3, 1), to: new Date(y, 5, 30) }
    }
  },
  {
    label: 'Third Quarter',
    range: () => {
      const y = new Date().getFullYear()

      return { from: new Date(y, 6, 1), to: new Date(y, 8, 30) }
    }
  },
  {
    label: 'Fourth Quarter',
    range: () => {
      const y = new Date().getFullYear()

      return { from: new Date(y, 9, 1), to: new Date(y, 11, 31) }
    }
  },
  {
    label: 'Current Year',
    range: () => {
      const y = new Date().getFullYear()

      return { from: new Date(y, 0, 1), to: new Date(y, 11, 31) }
    }
  },
  {
    label: 'Previous Year',
    range: () => {
      const y = new Date().getFullYear() - 1

      return { from: new Date(y, 0, 1), to: new Date(y, 11, 31) }
    }
  },
  { label: 'Custom Range', range: () => null }
] as const

function formatDateRange(range: DateRange): string {
  if (!range?.from) return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const from = range.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (!range.to || range.to.getTime() === range.from.getTime()) return from
  const to = range.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return `${from} - ${to}`
}

export interface DateRangePickerProps {
  placeholder?: string
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
  className?: string
  showPresets?: boolean
  presets?: Array<{ label: string; range: () => DateRange | null }>
  align?: 'center' | 'start' | 'end'
}

export function DateRangePicker({
  placeholder = '',
  value,
  onChange,
  className,
  showPresets = true,
  presets = DEFAULT_PRESETS as any,
  align = 'end'
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>(value)
  const [activePreset, setActivePreset] = useState<string>('')
  const [month, setMonth] = useState<Date | undefined>(value?.from || new Date())

  // Sync draft and activePreset when popover opens or value changes
  useEffect(() => {
    if (open) {
      setDraft(value)

      if (value?.from) {
        setMonth(value.from)

        const matched = presets.find(preset => {
          const range = preset.range()

          return (
            range &&
            range.from?.toDateString() === value.from?.toDateString() &&
            range.to?.toDateString() === value.to?.toDateString()
          )
        })

        setActivePreset(matched ? matched.label : '')
      } else {
        setActivePreset('')
      }
    }
  }, [open, value, presets])

  function applyPreset(preset: { label: string; range: () => DateRange | null }) {
    const result = preset.range()

    if (result) {
      setDraft(result)
      setActivePreset(preset.label)

      if (result.from) {
        setMonth(result.from)
      }
    } else {
      // Custom Range — just let the user pick on the calendar
      setDraft(undefined)
      setActivePreset(preset.label)
    }
  }

  function handleApply() {
    onChange(draft)
    setOpen(false)
  }

  function handleCancel() {
    setDraft(value)
    setActivePreset('')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'h-7 flex justify-between items-center gap-1.5 bg-[#1f1f1f] hover:bg-[#1f1f1f] border border-border placeholder:text-[#a7a7ae] text-[#f4f4f5] px-2.5! py-1.25 rounded text-sm font-normal whitespace-nowrap cursor-pointer transition-all',
            className
          )}
        >
          <span className='flex items-center gap-1'>
            <CalendarDays className='size-3.5 shrink-0' />
            {value ? formatDateRange(value) : placeholder}
          </span>
          <ChevronDown className='size-3 text-muted-foreground' />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className='w-auto p-0 flex rounded-md border border-border bg-[#09090B] shadow-xl overflow-hidden'
        align={align}
        sideOffset={4}
      >
        {/* ── Left: calendars ── */}
        <div className={cn('p-3 flex flex-col', showPresets && 'border-r border-border/20')}>
          <Calendar
            mode='range'
            selected={draft}
            onSelect={setDraft}
            month={month}
            onMonthChange={setMonth}
            numberOfMonths={2}
            showOutsideDays
            className='bg-transparent text-light border-0 p-0 overflow-hidden'
          />

          {/* Apply / Cancel */}
          <div className='flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border/20'>
            <Button
              onClick={handleApply}
              size='sm'
              className='text-xs font-medium px-4 h-6 rounded-sm transition-colors'
            >
              Apply
            </Button>
            <Button
              onClick={handleCancel}
              variant='outline'
              size='sm'
              className='text-xs font-medium px-4 h-6 rounded-sm transition-colors'
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* ── Right: preset list ── */}
        {showPresets && (
          <div className='w-40 flex flex-col p-1.5 overflow-y-auto bg-card/50'>
            <p className='text-sm text-muted-foreground mb-2'>Select Date Range</p>

            {presets.map(preset => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className={`text-left p-2 rounded-md text-xs leading-none transition-colors cursor-pointer ${
                  activePreset === preset.label
                    ? 'bg-accent text-white font-semibold'
                    : 'text-accent-foreground hover:bg-[#1F1F1F]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
