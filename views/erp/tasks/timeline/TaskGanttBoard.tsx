'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, addDays, differenceInDays, startOfDay, parseISO, isValid } from 'date-fns'
import { Client, Staff, Task, TaskReminder, TaskReminderChannel, TaskType } from '@/types'
import TaskService from '@/services/api/tasks/tasks.service'
import CreateOrEditTaskModal from '@/views/erp/tasks/CreateOrEditTaskModal'
import { toast } from 'sonner'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import GanttFilter from '@/views/erp/tasks/timeline/GanttFilter'
import GanttTaskRow, { GanttTask } from '@/views/erp/tasks/timeline/GanttTaskRow'
import { Card, CardContent } from '@/components/ui/card'

// ─── Status colours (legend only) ───────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string }> = {
  backlog: { bg: 'bg-slate-600' },
  'to-do': { bg: 'bg-blue-600' },
  overdue: { bg: 'bg-red-600' },
  'in-progress': { bg: 'bg-yellow-500' },
  completed: { bg: 'bg-emerald-600' },
  cancelled: { bg: 'bg-zinc-600' }
}

// ─── Day-column width (px) ────────────────────────────────────────────────────
const DAY_W = 80 // wide enough to show day name + number
const ROW_H = 72 // task row height
const HDR_MONTH = 28 // month header height
const HDR_DAY = 40 // day header height (two lines)

// ─── Helpers ─────────────────────────────────────────────────────────────────
const safeDate = (s?: string | null): Date | null => {
  if (!s) return null
  const d = parseISO(s)

  return isValid(d) ? startOfDay(d) : null
}

interface Props {
  initialTasks?: Task[]
  staffs?: Staff[]
  clients?: Client[]
  taskTypes?: TaskType[]
  taskReminders?: TaskReminder[]
  taskReminderChannels?: TaskReminderChannel[]
}

export default function TaskGanttBoard({
  initialTasks = [],
  staffs = [],
  clients = [],
  taskTypes = [],
  taskReminders = [],
  taskReminderChannels = []
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [allTasks, setAllTasks] = useState<Task[]>(initialTasks)
  const [isLoading, setIsLoading] = useState(false)

  const defaultStart = format(addDays(startOfDay(new Date()), -15), 'yyyy-MM-dd')
  const defaultEnd = format(addDays(startOfDay(new Date()), 15), 'yyyy-MM-dd')

  const [filters, setFilters] = useState<{ starting_date?: string; ending_date?: string }>({
    starting_date: searchParams.get('starting_date') || defaultStart,
    ending_date: searchParams.get('ending_date') || defaultEnd
  })

  const [isExtending, setIsExtending] = useState<'forward' | 'back' | null>(null)

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const hasUserChangedFilter = useRef(false)
  const skipFullRefetch = useRef(false)

  // ── Fetch tasks ─────────────────────────────────────────────────────────────
  const fetchTasks = async (f: { starting_date?: string; ending_date?: string }) => {
    setIsLoading(true)

    try {
      const res = await TaskService.getAll(f)

      setAllTasks(Array.isArray(res.data) ? res.data : [])
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }

  // Sync server-rendered initial tasks
  useEffect(() => {
    setAllTasks(Array.isArray(initialTasks) ? initialTasks : [])
  }, [initialTasks])

  // Re-fetch only on user-initiated filter change
  useEffect(() => {
    if (!hasUserChangedFilter.current) return

    if (skipFullRefetch.current) {
      skipFullRefetch.current = false

      return
    }

    const params = new URLSearchParams()

    if (filters.starting_date) params.set('starting_date', filters.starting_date)
    if (filters.ending_date) params.set('ending_date', filters.ending_date)

    router.replace(params.toString() ? `?${params.toString()}` : '?', { scroll: false })
    fetchTasks(filters)
  }, [filters.starting_date, filters.ending_date])

  const handleFilterChange = (f: { starting_date?: string; ending_date?: string }) => {
    hasUserChangedFilter.current = true
    setFilters(f)
  }

  // ── Clear filters ───────────────────────────────────────────────────────────
  const handleClear = () => {
    handleFilterChange({
      starting_date: format(addDays(startOfDay(new Date()), -15), 'yyyy-MM-dd'),
      ending_date: format(addDays(startOfDay(new Date()), 15), 'yyyy-MM-dd')
    })
  }

  // ── Extend range forward (+30 days, fetch only delta) ──────────────────────
  const handleExtendForward = async () => {
    const baseEnd = filters.ending_date
      ? startOfDay(parseISO(filters.ending_date))
      : addDays(startOfDay(new Date()), 15)

    const fetchFrom = addDays(baseEnd, 1)
    const fetchTo = addDays(baseEnd, 30)
    const newEndDate = format(fetchTo, 'yyyy-MM-dd')

    skipFullRefetch.current = true
    hasUserChangedFilter.current = true
    setFilters(prev => ({ ...prev, ending_date: newEndDate }))

    const urlParams = new URLSearchParams()

    if (filters.starting_date) urlParams.set('starting_date', filters.starting_date)
    urlParams.set('ending_date', newEndDate)
    router.replace(`?${urlParams.toString()}`, { scroll: false })

    setIsExtending('forward')

    try {
      const res = await TaskService.getAll({
        starting_date: format(fetchFrom, 'yyyy-MM-dd'),
        ending_date: newEndDate
      })

      const newTasks = Array.isArray(res.data) ? res.data : []

      setAllTasks(prev => {
        const existingIds = new Set(prev.map((t: Task) => t.id))

        return [...prev, ...newTasks.filter((t: Task) => !existingIds.has(t.id))]
      })
    } catch {
      // silent
    } finally {
      setIsExtending(null)
    }
  }

  // ── Extend range back (−30 days, fetch only delta) ───────────────────────────
  const handleExtendBack = async () => {
    const baseStart = filters.starting_date
      ? startOfDay(parseISO(filters.starting_date))
      : addDays(startOfDay(new Date()), -15)

    const fetchTo = addDays(baseStart, -1)
    const fetchFrom = addDays(baseStart, -30)
    const newStartDate = format(fetchFrom, 'yyyy-MM-dd')

    skipFullRefetch.current = true
    hasUserChangedFilter.current = true
    setFilters(prev => ({ ...prev, starting_date: newStartDate }))

    const urlParams = new URLSearchParams()

    urlParams.set('starting_date', newStartDate)
    if (filters.ending_date) urlParams.set('ending_date', filters.ending_date)
    router.replace(`?${urlParams.toString()}`, { scroll: false })

    setIsExtending('back')

    try {
      const res = await TaskService.getAll({
        starting_date: newStartDate,
        ending_date: format(fetchTo, 'yyyy-MM-dd')
      })

      const newTasks = Array.isArray(res.data) ? res.data : []

      setAllTasks(prev => {
        const existingIds = new Set(prev.map(t => t.id))

        return [...newTasks.filter((t: Task) => !existingIds.has(t.id)), ...prev]
      })
    } catch {
      // silent
    } finally {
      setIsExtending(null)
    }
  }

  // ── Scroll to today ──────────────────────────────────────────────────────────
  const handleScrollToToday = () => {
    if (!scrollAreaRef.current) return
    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')

    if (!viewport) return
    const rs = filters.starting_date ? startOfDay(parseISO(filters.starting_date)) : startOfDay(new Date())
    const todayX = differenceInDays(startOfDay(new Date()), rs) * DAY_W

    viewport.scrollLeft = Math.max(todayX - 200, 0)
  }

  // ── Handle edit ─────────────────────────────────────────────────────────────
  const handleEdit = async (task: Task) => {
    try {
      const res = await TaskService.show(task.id)

      setSelectedTask(res.data)
      setModalMode('edit')
      setModalOpen(true)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to fetch task details')
    }
  }

  // ── Compute Gantt range ──────────────────────────────────────────────────────
  const ganttTasks: GanttTask[] = (Array.isArray(allTasks) ? allTasks : [])
    .map(t => {
      const startD = safeDate(t.start_date)
      const endD = safeDate(t.end_date) ?? startD

      if (!startD) return null

      return { ...t, startD, endD: endD! }
    })
    .filter(Boolean) as GanttTask[]

  const rangeStart = filters.starting_date
    ? startOfDay(parseISO(filters.starting_date))
    : ganttTasks.length > 0
      ? ganttTasks.reduce((min, t) => (t.startD < min ? t.startD : min), ganttTasks[0].startD)
      : startOfDay(new Date())

  const rangeEnd = filters.ending_date
    ? startOfDay(parseISO(filters.ending_date))
    : ganttTasks.length > 0
      ? ganttTasks.reduce((max, t) => (t.endD > max ? t.endD : max), ganttTasks[0].endD)
      : addDays(rangeStart, 30)

  const totalDays = Math.max(differenceInDays(rangeEnd, rangeStart) + 1, 1)

  // Build day headers
  const days = Array.from({ length: totalDays }, (_, i) => addDays(rangeStart, i))

  // Group days into months for the header
  const monthGroups: { label: string; span: number }[] = []
  let curMonth = format(days[0], 'MMM yyyy')
  let span = 0

  days.forEach(d => {
    const m = format(d, 'MMM yyyy')

    if (m === curMonth) {
      span++
    } else {
      monthGroups.push({ label: curMonth, span })
      curMonth = m
      span = 1
    }
  })

  monthGroups.push({ label: curMonth, span })

  // Today marker
  const today = startOfDay(new Date())
  const todayOffset = differenceInDays(today, rangeStart)
  const showToday = todayOffset >= 0 && todayOffset < totalDays

  // ── Task bar geometry ────────────────────────────────────────────────────────
  const barLeft = (task: GanttTask) => Math.max(differenceInDays(task.startD, rangeStart), 0) * DAY_W

  const barWidth = (task: GanttTask) => {
    const clampedStart = task.startD < rangeStart ? rangeStart : task.startD
    const clampedEnd = task.endD > rangeEnd ? rangeEnd : task.endD
    const days = Math.max(differenceInDays(clampedEnd, clampedStart) + 1, 1)

    return days * DAY_W
  }

  const LABEL_COL = 260 // px width for the left task-label column
  const gridWidth = totalDays * DAY_W

  return (
    <Card>
      <CardContent className='flex flex-col gap-6 p-6!'>
        {/* ── Date-range filter bar ──────────────────────────────────────────── */}
        <GanttFilter
          initialFilters={filters}
          hasActiveFilter={!!(filters.starting_date || filters.ending_date)}
          onApply={handleFilterChange}
          onClear={handleClear}
        />

        {isLoading && (
          <div className='space-y-2'>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className='h-10 w-full' />
            ))}
          </div>
        )}

        {!isLoading && (
          <div className='rounded-md border border-zinc-800 bg-zinc-900 overflow-hidden'>
            {/* ── Range navigation — sticky, outside scroll ───────────────── */}
            <div
              className='py-6 flex items-center justify-center gap-3 border-b border-zinc-700 bg-zinc-800'
              style={{ height: HDR_MONTH }}
            >
              <button
                type='button'
                onClick={handleExtendBack}
                disabled={isExtending !== null}
                className='text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded disabled:opacity-50'
                title='Extend 30 days back'
              >
                {isExtending === 'back' ? (
                  <Loader2 className='h-6 w-6 animate-spin' />
                ) : (
                  <ChevronLeft className='h-6 w-6' />
                )}
              </button>
              <span className='font-semibold text-zinc-300 select-none text-center min-w-44'>
                {format(rangeStart, 'MMM d')} – {format(rangeEnd, 'MMM d, yyyy')}
              </span>
              <button
                type='button'
                onClick={handleExtendForward}
                disabled={isExtending !== null}
                className='text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded disabled:opacity-50'
                title='Extend 30 days forward'
              >
                {isExtending === 'forward' ? (
                  <Loader2 className='h-6 w-6 animate-spin' />
                ) : (
                  <ChevronRight className='h-6 w-6' />
                )}
              </button>
            </div>

            <div ref={scrollAreaRef}>
              <ScrollArea className='w-full' style={{ maxHeight: 'calc(100vh - 260px)' }}>
                <div style={{ width: LABEL_COL + gridWidth, minWidth: LABEL_COL + gridWidth }}>
                  {/* ── Day header ─────────────────────────────────────────── */}
                  <div
                    className='flex border-b border-zinc-700 bg-zinc-800/90 py-6'
                    style={{ position: 'sticky', top: 0, zIndex: 20, height: HDR_DAY }}
                  >
                    {/* Label spacer — sticky left */}
                    <div
                      style={{
                        width: LABEL_COL,
                        minWidth: LABEL_COL,
                        position: 'sticky',
                        left: 0,
                        zIndex: 30,
                        background: 'rgb(39 39 42 / 1)'
                      }}
                      className='z-50! shrink-0 border-r border-zinc-700 flex items-center px-3 font-bold text-background'
                    >
                      Tasks
                    </div>
                    {/* Days */}
                    {days.map((d, i) => {
                      const dow = d.getDay()
                      const isWeekend = dow === 0 || dow === 6
                      const isToday = i === todayOffset

                      return (
                        <div
                          key={i}
                          style={{ width: DAY_W, minWidth: DAY_W }}
                          className={[
                            'shrink-0 flex flex-col items-center justify-center border-r border-zinc-800 last:border-r-0 select-none',
                            isWeekend ? 'bg-zinc-800/60 text-zinc-500' : 'text-zinc-400',
                            isToday ? 'bg-blue-900/50! text-blue-300! font-bold' : ''
                          ].join(' ')}
                        >
                          <span className='text-[10px] leading-none'>{format(d, 'EEE')}</span>
                          <span className='text-sm font-semibold leading-tight mt-0.5'>{format(d, 'd')}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* ── Task rows ──────────────────────────────────────────── */}
                  {ganttTasks.length === 0 && (
                    <div className='flex' style={{ height: ROW_H }}>
                      <div
                        style={{
                          width: LABEL_COL,
                          minWidth: LABEL_COL,
                          position: 'sticky',
                          left: 0,
                          zIndex: 10,
                          background: 'rgb(24 24 27)'
                        }}
                        className='shrink-0 border-r border-zinc-700 flex items-center px-3'
                      >
                        <p className='text-xs text-zinc-500'>No tasks</p>
                      </div>
                      <div className='relative flex-1' style={{ background: 'rgb(24 24 27)' }} />
                    </div>
                  )}
                  {ganttTasks.map((task, rowIdx) => (
                    <GanttTaskRow
                      key={task.id}
                      task={task}
                      rowIdx={rowIdx}
                      labelCol={LABEL_COL}
                      gridWidth={gridWidth}
                      dayW={DAY_W}
                      rowH={ROW_H}
                      days={days}
                      barLeft={barLeft(task)}
                      barWidth={barWidth(task)}
                      todayOffset={todayOffset}
                      showToday={showToday}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
                <ScrollBar orientation='horizontal' className='mt-1' />
                <ScrollBar orientation='vertical' />
              </ScrollArea>
            </div>

            {/* Legend */}
            <div className='flex flex-wrap gap-3 px-4 py-2 border-t border-zinc-800 bg-zinc-800/30 items-center'>
              {Object.entries(STATUS_COLORS).map(([status, c]) => (
                <div key={status} className='flex items-center gap-1.5'>
                  <span className={`inline-block h-3 w-3 rounded-sm ${c.bg}`} />
                  <span className='text-[11px] text-zinc-400 capitalize'>{status}</span>
                </div>
              ))}
              <button
                type='button'
                onClick={handleScrollToToday}
                className='ml-auto text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-700 rounded px-2 py-0.5'
              >
                Today
              </button>
            </div>
          </div>
        )}

        <CreateOrEditTaskModal
          mode={modalMode}
          open={modalOpen}
          onOpenChange={open => {
            setModalOpen(open)
            if (!open) setSelectedTask(null)
          }}
          taskId={selectedTask?.id}
          taskDetails={selectedTask ?? undefined}
          staffs={staffs}
          clients={clients}
          taskTypes={taskTypes}
          taskReminders={taskReminders}
          taskReminderChannels={taskReminderChannels}
          onSuccess={async () => {
            try {
              const res = await TaskService.getAll()

              setAllTasks(Array.isArray(res.data) ? res.data : [])
            } catch {
              // keep current
            }

            setModalOpen(false)
            setSelectedTask(null)
          }}
        />
      </CardContent>
    </Card>
  )
}
