import React, { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import { CalendarDays } from 'lucide-react'

import { DATE_PRESETS, fmtInput, fmtTrigger } from '../utils'

interface DateRangePickerProps {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>(value)
  const [activePreset, setActivePreset] = useState<string>('')
  const ref = useRef<HTMLDivElement>(null)

  // Sync draft when external value changes
  useEffect(() => {
    setDraft(value)
  }, [value])

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }

    if (open) document.addEventListener('mousedown', onOutside)

    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  function applyPreset(preset: (typeof DATE_PRESETS)[number]) {
    const result = preset.range()

    if (result) {
      setDraft(result)
      setActivePreset(preset.label)
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
    <div ref={ref} className='relative'>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className='flex items-center gap-1.5 border border-border/40 rounded px-2.5 py-1.5 text-xs text-muted-foreground hover:text-card-foreground whitespace-nowrap cursor-pointer! transition-all'
      >
        <CalendarDays className='w-3 h-3 shrink-0' />
        {fmtTrigger(value)}
        <span className='ml-0.5'>▾</span>
      </button>

      {open && (
        <div className='absolute right-0 top-full mt-1 z-50 flex rounded border border-border/40 bg-card shadow-xl overflow-hidden'>
          {/* ── Left: calendars + inputs ── */}
          <div className='p-3 border-r border-border/20'>
            {/* Date inputs */}
            <div className='flex items-center gap-2 mb-3'>
              <div className='flex items-center gap-1.5 border border-border/40 rounded px-2 py-1'>
                <CalendarDays className='w-3 h-3 text-blue-400 shrink-0' />
                <input
                  type='text'
                  readOnly
                  value={fmtInput(draft?.from)}
                  placeholder='MM/DD/YYYY'
                  className='w-24 bg-transparent text-xs text-card-foreground outline-none placeholder-muted-foreground'
                />
              </div>
              <span className='text-muted-foreground text-xs'>—</span>
              <div className='flex items-center gap-1.5 border border-border/40 rounded px-2 py-1'>
                <CalendarDays className='w-3 h-3 text-blue-400 shrink-0' />
                <input
                  type='text'
                  readOnly
                  value={fmtInput(draft?.to)}
                  placeholder='MM/DD/YYYY'
                  className='w-24 bg-transparent text-xs text-card-foreground outline-none placeholder-muted-foreground'
                />
              </div>
            </div>

            {/* Two-month calendar */}
            <DayPicker
              mode='range'
              selected={draft}
              onSelect={setDraft}
              numberOfMonths={2}
              showOutsideDays
              classNames={{
                months: 'flex gap-4',
                month: 'flex flex-col gap-2',
                month_caption: 'flex items-center justify-center text-xs font-semibold text-card-foreground py-1',
                nav: 'flex items-center justify-between absolute top-0 w-full px-1',
                button_previous: 'p-1 rounded hover:bg-border/20 text-muted-foreground',
                button_next: 'p-1 rounded hover:bg-border/20 text-muted-foreground',
                weekdays: 'flex',
                weekday: 'w-8 h-6 flex items-center justify-center text-[10px] text-muted-foreground font-medium',
                weeks: 'flex flex-col gap-1',
                week: 'flex',
                day: 'w-8 h-8 flex items-center justify-center',
                day_button:
                  'w-7 h-7 rounded text-[11px] hover:bg-border/30 text-card-foreground transition-colors cursor-pointer',
                selected: '[&>button]:bg-blue-600 [&>button]:text-white [&>button]:hover:bg-blue-700',
                range_start: '[&>button]:bg-blue-600 [&>button]:text-white [&>button]:rounded-l-full',
                range_middle: '[&>button]:bg-blue-500/20 [&>button]:text-card-foreground [&>button]:rounded-none',
                range_end: '[&>button]:bg-blue-600 [&>button]:text-white [&>button]:rounded-r-full',
                today: '[&>button]:font-bold [&>button]:border [&>button]:border-primary',
                outside: '[&>button]:text-muted-foreground [&>button]:opacity-40',
                disabled: '[&>button]:opacity-20 [&>button]:cursor-not-allowed',
                caption_label: 'text-xs font-semibold text-card-foreground',
                root: 'relative'
              }}
            />

            {/* Apply / Cancel */}
            <div className='flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border/20'>
              <button
                onClick={handleApply}
                className='bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded transition-colors'
              >
                Apply
              </button>
              <button
                onClick={handleCancel}
                className='border border-border/40 text-muted-foreground hover:text-card-foreground text-xs px-4 py-1.5 rounded transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>

          {/* ── Right: preset list ── */}
          <div className='w-40 flex flex-col py-1 overflow-y-auto'>
            {DATE_PRESETS.map(preset => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className={`text-left px-4 py-2 text-xs transition-colors ${
                  activePreset === preset.label
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-blue-400 hover:bg-border/20'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
