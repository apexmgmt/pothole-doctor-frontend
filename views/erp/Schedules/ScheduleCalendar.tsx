'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar'
import { format } from 'date-fns/format'
import { parse } from 'date-fns/parse'
import { startOfWeek } from 'date-fns/startOfWeek'
import { getDay } from 'date-fns/getDay'
import { enUS } from 'date-fns/locale/en-US'
import { startOfMonth } from 'date-fns/startOfMonth'
import { endOfMonth } from 'date-fns/endOfMonth'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Schedule } from '@/types/schedules'
import { Client, Partner, ServiceType, WorkOrder } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import ScheduleService from '@/services/api/schedules.service'
import { useRouter, useSearchParams } from 'next/navigation'
import { getInitialFilters, updateURL } from '@/utils/utility'
import { toast } from 'sonner'
import ScheduleCalendarFilter from './ScheduleCalendarFilter'
import ScheduleFormDialog from './ScheduleFormDialog'

// Setup date-fns localizer for the calendar
const locales = {
  'en-US': enUS
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
})

const getMonthBounds = (date: Date) => ({
  starting_date: format(startOfMonth(date), 'yyyy-MM-dd'),
  ending_date: format(endOfMonth(date), 'yyyy-MM-dd')
})

interface ScheduleCalendarProps {
  clients: Client[]
  workOrders: WorkOrder[]
  serviceTypes: ServiceType[]
  partners: Partner[]
}

export default function ScheduleCalendar({
  clients = [],
  workOrders = [],
  serviceTypes = [],
  partners = []
}: ScheduleCalendarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialFilters = getInitialFilters(searchParams)

  const initialDate = initialFilters.starting_date ? new Date(initialFilters.starting_date) : new Date()

  const [currentDate, setCurrentDate] = useState<Date>(initialDate)
  const [currentView, setCurrentView] = useState<View>(Views.MONTH)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const [filterOptions, setFilterOptions] = useState<any>(() => {
    if (!initialFilters.starting_date || !initialFilters.ending_date) {
      return { ...getMonthBounds(initialDate), ...initialFilters }
    }

    return initialFilters
  })

  useEffect(() => {
    setIsLoading(true)
    ScheduleService.getAll(filterOptions)
      .then(response => {
        setSchedules(Array.isArray(response) ? response : response.data || [])
        setIsLoading(false)
      })
      .catch(error => {
        toast.error(error.message || 'Failed to fetch schedules')
        setIsLoading(false)
      })
    updateURL(router, filterOptions)
  }, [filterOptions, refreshKey])

  const handleNavigate = (date: Date) => {
    setCurrentDate(date)
    setFilterOptions((prev: any) => ({ ...prev, ...getMonthBounds(date) }))
  }

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start)
    setSelectedSchedule(null)
    setDialogMode('create')
    setDialogOpen(true)
  }

  const handleSelectEvent = (event: any) => {
    setSelectedSchedule(event.resource as Schedule)
    setSelectedDate(undefined)
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const events = useMemo(() => {
    return schedules.map(schedule => {
      const startString = `${schedule.starting_date}T${schedule.starting_time || '00:00:00'}`
      const endString = `${schedule.ending_date}T${schedule.ending_time || '23:59:59'}`

      return {
        id: schedule.id,
        title: `${schedule.title} `,
        start: new Date(startString),
        end: new Date(endString),
        resource: schedule
      }
    })
  }, [schedules])

  const eventPropGetter = (event: any) => {
    const status = event.resource.status
    let backgroundColor = '#3174ad'

    if (status === 'scheduled') backgroundColor = '#0ea5e9'
    if (status === 'completed') backgroundColor = '#22c55e'
    if (status === 'pending') backgroundColor = '#64748b'
    if (status === 'cancelled') backgroundColor = '#ef4444'

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  return (
    <div className='flex gap-4 items-start'>
      <ScheduleCalendarFilter
        clients={clients}
        workOrders={workOrders}
        serviceTypes={serviceTypes}
        partners={partners}
        filterOptions={filterOptions}
        setFilterOptions={setFilterOptions}
      />

      <Card className='shadow-sm flex-1 h-[800px] p-4'>
        <CardContent className='h-full p-0'>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor='start'
            endAccessor='end'
            style={{ height: '100%' }}
            views={['month', 'week', 'day', 'agenda']}
            view={currentView}
            onView={view => setCurrentView(view)}
            date={currentDate}
            onNavigate={handleNavigate}
            eventPropGetter={eventPropGetter}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
          />
        </CardContent>
      </Card>

      <ScheduleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        schedule={selectedSchedule}
        defaultDate={selectedDate}
        defaultContractorId={filterOptions.contractor_id}
        partners={partners}
        workOrders={workOrders}
        onSuccess={() => setRefreshKey(k => k + 1)}
      />
    </div>
  )
}
