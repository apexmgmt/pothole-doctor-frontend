'use client'

import React from 'react'
import { type ToolbarProps, Views } from 'react-big-calendar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ScheduleCalendarEventType } from './ScheduleCalendarEvent'

const calendarViewOptions = [Views.MONTH, Views.WEEK, Views.DAY] as const

/**
 * Custom toolbar for react-big-calendar.
 * Provides navigation controls and view switching using app-styled buttons.
 */
export function ScheduleCalendarToolbar({
  label,
  onNavigate,
  onView,
  view
}: ToolbarProps<ScheduleCalendarEventType, object>) {
  return (
    <div className='mb-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-zinc-950/70 p-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-2'>
        <Button type='button' variant='outline' size='sm' onClick={() => onNavigate('TODAY')}>
          Today
        </Button>
        <div className='flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900/80 p-1'>
          <Button type='button' variant='ghost' size='icon-sm' onClick={() => onNavigate('PREV')}>
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button type='button' variant='ghost' size='icon-sm' onClick={() => onNavigate('NEXT')}>
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
        <div className='pl-1 font-medium text-white'>{label}</div>
      </div>

      <div className='flex flex-wrap items-center gap-1 rounded-lg border border-white/10 bg-zinc-900/80 p-1'>
        {calendarViewOptions.map(option => {
          const isActive = view === option

          return (
            <Button
              key={option}
              type='button'
              size='sm'
              variant={isActive ? 'primary' : 'ghost'}
              className='capitalize'
              onClick={() => onView(option)}
            >
              {option}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
