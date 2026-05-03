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
import { getPaletteColorByKey } from '@/constants/colors'
import { SpinnerCustom } from '@/components/ui/spinner'
import {
  ScheduleCalendarEvent,
  ScheduleCalendarAgendaEvent,
  type ScheduleCalendarEventType
} from './ScheduleCalendarEvent'
import { ScheduleCalendarToolbar } from './ScheduleCalendarToolbar'

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

/**
 * Main schedule calendar container.
 * Handles filtering, schedule fetching, view/date state, and form dialog interactions.
 */
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

  const applyFilterOptions: React.Dispatch<React.SetStateAction<any>> = updater => {
    setIsLoading(true)
    setFilterOptions(updater)
  }

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

  /**
   * Updates calendar date and syncs month bounds into filter options.
   */
  const handleNavigate = (date: Date) => {
    setCurrentDate(date)
    applyFilterOptions((prev: any) => ({ ...prev, ...getMonthBounds(date) }))
  }

  /**
   * Opens create dialog with the clicked date preselected.
   */
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setIsAutoOpenDialog(false)
    setSelectedDate(start)
    setSelectedSchedule(null)
    setDialogMode('create')
    setDialogOpen(true)
  }

  /**
   * Opens edit dialog for the selected schedule event.
   */
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

  const displayedEvents = isLoading ? [] : events

  /**
   * Applies deterministic event background styling by contractor or event ID.
   */
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
        setFilterOptions={applyFilterOptions}
      />

      <Card className='schedule-calendar-shell shadow-sm flex-1 border-white/10 bg-zinc-950/70 p-4 text-white backdrop-blur'>
        <CardContent className='relative p-0'>
          {isLoading && (
            <div className='absolute inset-0 z-10 flex items-center justify-center rounded-md bg-zinc-950/55 backdrop-blur-sm'>
              <div className='flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/90 px-4 py-3 text-sm text-white'>
                <SpinnerCustom position='static' zIndex={0} size='size-5' className='inset-auto!' />
                <span>Loading schedules...</span>
              </div>
            </div>
          )}
          <Calendar
            localizer={localizer}
            events={displayedEvents}
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
            selectable={!isLoading}
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
