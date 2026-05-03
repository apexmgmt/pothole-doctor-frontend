'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer, type ToolbarProps, View, Views } from 'react-big-calendar'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ScheduleService from '@/services/api/schedules.service'
import { useRouter, useSearchParams } from 'next/navigation'
import { getInitialFilters, updateURL } from '@/utils/utility'
import { toast } from 'sonner'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import ScheduleCalendarFilter from './ScheduleCalendarFilter'
import ScheduleFormDialog from './ScheduleFormDialog'
import { getPaletteColorByKey } from '@/constants/colors'

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

const calendarViewOptions = [Views.MONTH, Views.WEEK, Views.DAY] as const

type ScheduleCalendarEventType = {
  id: string
  title: string
  start: Date
  end: Date
  resource: Schedule
}

const getScheduleStatusVariant = (status?: string) => {
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

const getContractorName = (schedule?: Schedule) => {
  const firstName = schedule?.contractor?.first_name || ''
  const lastName = schedule?.contractor?.last_name || ''

  return `${firstName} ${lastName}`.trim() || 'N/A'
}

const getCustomerName = (schedule?: Schedule) => {
  const displayName = schedule?.client?.display_name || ''
  const firstName = schedule?.client?.first_name || ''
  const lastName = schedule?.client?.last_name || ''

  return displayName || `${firstName} ${lastName}`.trim() || 'N/A'
}

const getWorkOrderAddress = (schedule?: Schedule) => {
  const address = schedule?.work_order?.address
  const street = address?.street_address || ''
  const city = address?.city?.name || ''
  const state = address?.state?.name || ''
  const zip = address?.zip_code || ''

  return [street, city, state, zip].filter(Boolean).join(', ') || 'N/A'
}

function ScheduleCalendarToolbar({ label, onNavigate, onView, view }: ToolbarProps<ScheduleCalendarEventType, object>) {
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

function ScheduleCalendarAgendaEvent({ event }: { event?: { resource?: Schedule; title?: string } }) {
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

function ScheduleCalendarEvent({ event }: { event?: ScheduleCalendarEventType }) {
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

  // Special params for auto-opening the form dialog from work order navigation
  const openDialogOnMount = searchParams.get('open_dialog') === 'true'
  const defaultDialogServiceGroupId = searchParams.get('dialog_service_group_id') || undefined

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
  const [isAutoOpenDialog, setIsAutoOpenDialog] = useState(openDialogOnMount)

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

  // Auto-open the form dialog when navigated from work order with open_dialog param
  useEffect(() => {
    if (openDialogOnMount) {
      setDialogMode('create')
      setDialogOpen(true)
    }
  }, [])

  const handleNavigate = (date: Date) => {
    setCurrentDate(date)
    setFilterOptions((prev: any) => ({ ...prev, ...getMonthBounds(date) }))
  }

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setIsAutoOpenDialog(false)
    setSelectedDate(start)
    setSelectedSchedule(null)
    setDialogMode('create')
    setDialogOpen(true)
  }

  const handleSelectEvent = (event: any) => {
    setIsAutoOpenDialog(false)
    setSelectedSchedule(event.resource as Schedule)
    setSelectedDate(undefined)
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const isSingleContractorView = useMemo(() => {
    const contractorId = filterOptions?.contractor_id

    if (contractorId == null) return false

    if (typeof contractorId === 'string') {
      const normalized = contractorId.trim().toLowerCase()

      return normalized !== '' && normalized !== 'all'
    }

    return true
  }, [filterOptions?.contractor_id])

  const events = useMemo<ScheduleCalendarEventType[]>(() => {
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

  const eventPropGetter = (event: ScheduleCalendarEventType) => {
    const schedule = event.resource
    const colorKey = isSingleContractorView ? schedule?.id : schedule?.contractor_id || schedule?.contractor?.id
    const color = getPaletteColorByKey(colorKey)

    return {
      style: {
        backgroundColor: color,
        borderRadius: '6px',
        opacity: 0.92,
        color: 'white',
        border: 'none',
        display: 'block',
        boxShadow: `0 1px 4px ${color}55`
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

      <Card className='schedule-calendar-shell shadow-sm flex-1 border-white/10 bg-zinc-950/70 p-4 text-white backdrop-blur'>
        <CardContent className='p-0'>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor='start'
            endAccessor='end'
            style={{ height: 800 }}
            showAllEvents
            views={['month', 'week', 'day']}
            view={currentView}
            onView={view => setCurrentView(view)}
            date={currentDate}
            onNavigate={handleNavigate}
            eventPropGetter={eventPropGetter}
            components={{
              toolbar: ScheduleCalendarToolbar,
              event: ScheduleCalendarEvent,
              agenda: {
                event: ScheduleCalendarAgendaEvent
              }
            }}
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
        defaultWorkOrderId={isAutoOpenDialog ? filterOptions.work_order_id || undefined : undefined}
        defaultServiceGroupId={isAutoOpenDialog ? defaultDialogServiceGroupId : undefined}
        defaultServiceTypeId={isAutoOpenDialog ? filterOptions.service_type_id || undefined : undefined}
        partners={partners}
        workOrders={workOrders}
        onSuccess={() => setRefreshKey(k => k + 1)}
      />
    </div>
  )
}
