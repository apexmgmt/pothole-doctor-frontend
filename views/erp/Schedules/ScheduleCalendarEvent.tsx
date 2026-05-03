'use client'

import React from 'react'
import { CalendarDays } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Schedule } from '@/types/schedules'

export type ScheduleCalendarEventType = {
  id: string
  title: string
  start: Date
  end: Date
  resource: Schedule
}

export const getScheduleStatusVariant = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'pending':
      return 'pending'
    case 'cancelled':
      return 'destructive'
    default:
      return 'info'
  }
}

export const getContractorName = (schedule?: Schedule) => {
  const firstName = schedule?.contractor?.first_name || ''
  const lastName = schedule?.contractor?.last_name || ''

  return `${firstName} ${lastName}`.trim() || 'N/A'
}

export const getCustomerName = (schedule?: Schedule) => {
  const displayName = schedule?.client?.display_name || ''
  const firstName = schedule?.client?.first_name || ''
  const lastName = schedule?.client?.last_name || ''

  return displayName || `${firstName} ${lastName}`.trim() || 'N/A'
}

export const getWorkOrderAddress = (schedule?: Schedule) => {
  const address = schedule?.work_order?.address
  const street = address?.street_address || ''
  const city = address?.city?.name || ''
  const state = address?.state?.name || ''
  const zip = address?.zip_code || ''

  return [street, city, state, zip].filter(Boolean).join(', ') || 'N/A'
}

export function ScheduleCalendarEvent({ event }: { event?: ScheduleCalendarEventType }) {
  const schedule = event?.resource

  return (
    <div className='schedule-calendar-event-content'>
      <div className='schedule-calendar-event-title'>
        <CalendarDays className='h-3.5 w-3.5 shrink-0' />
        <span className='truncate'>{event?.title || schedule?.title || 'Untitled schedule'}</span>
      </div>
      <div className='schedule-calendar-event-line'>Service Type: {schedule?.service_type?.name || 'N/A'}</div>
      <div className='schedule-calendar-event-line'>Contractor: {getContractorName(schedule)}</div>
      <div className='schedule-calendar-event-line'>Customer: {getCustomerName(schedule)}</div>
      <div className='schedule-calendar-event-line'>Address: {getWorkOrderAddress(schedule)}</div>
    </div>
  )
}

export function ScheduleCalendarAgendaEvent({ event }: { event?: { resource?: Schedule; title?: string } }) {
  const schedule = event?.resource

  return (
    <div className='flex items-center gap-2'>
      <span className='text-sm text-white/90'>{event?.title || schedule?.title || 'Untitled schedule'}</span>
      <Badge variant={getScheduleStatusVariant(schedule?.status)} className='border-0 px-1.5 py-0 text-[10px]'>
        {schedule?.status || 'scheduled'}
      </Badge>
    </div>
  )
}
