'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, addDays, differenceInDays, startOfDay, parseISO, isValid } from 'date-fns'
import { Client, Staff, Task, TaskReminder, TaskReminderChannel, TaskType } from '@/types'
import TaskService from '@/services/api/tasks.service'
import CreateOrEditTaskModal from '@/views/erp/tasks/CreateOrEditTaskModal'
import KanbanFilter from '@/views/erp/tasks/kanban/KanbanFilter'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Status colours ──────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  backlog: { bg: 'bg-slate-600', text: 'text-white', border: 'border-slate-500' },
  'to-do': { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-500' },
  overdue: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-500' },
  'in-progress': { bg: 'bg-yellow-500', text: 'text-white', border: 'border-yellow-400' },
  completed: { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-500' },
  cancelled: { bg: 'bg-zinc-600', text: 'text-white', border: 'border-zinc-500' }
}

const statusColor = (status: string) =>
  STATUS_COLORS[status] ?? { bg: 'bg-zinc-700', text: 'text-white', border: 'border-zinc-600' }

// ─── Day-column width (px) ────────────────────────────────────────────────────
const DAY_W = 56 // wide enough to show day name + number
const ROW_H = 52 // task row height
const HDR_MONTH = 28 // month header height
const HDR_DAY = 40 // day header height (two lines)

// ─── Helpers ─────────────────────────────────────────────────────────────────
const safeDate = (s?: string | null): Date | null => {
  if (!s) return null
  const d = parseISO(s)

  return isValid(d) ? startOfDay(d) : null
}

interface GanttTask extends Task {
  startD: Date
  endD: Date
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

  const [filters, setFilters] = useState<{ starting_date?: string; ending_date?: string }>({
    starting_date: searchParams.get('starting_date') || undefined,
    ending_date: searchParams.get('ending_date') || undefined
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const hasUserChangedFilter = useRef(false)

  // ── Fetch tasks ─────────────────────────────────────────────────────────────
  const fetchTasks = async (f: { starting_date?: string; ending_date?: string }) => {
    setIsLoading(true)

    try {
      const res = await TaskService.getAll(f)

      setAllTasks(res.data || [])
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }

  // Sync server-rendered initial tasks
  useEffect(() => {
    setAllTasks(initialTasks)
  }, [initialTasks])

  // Re-fetch only on user-initiated filter change
  useEffect(() => {
    if (!hasUserChangedFilter.current) return

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
  const ganttTasks: GanttTask[] = allTasks
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
    <div className='flex flex-col gap-3'>
      {/* Filter */}
      <KanbanFilter onChange={handleFilterChange} initialFilters={filters} />

      {isLoading && (
        <div className='space-y-2'>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className='h-10 w-full' />
          ))}
        </div>
      )}

      {!isLoading && ganttTasks.length === 0 && (
        <div className='flex items-center justify-center h-40 bg-zinc-900 rounded-md border border-zinc-700 border-dashed'>
          <p className='text-zinc-400 text-sm'>No tasks with valid dates found for this range.</p>
        </div>
      )}

      {!isLoading && ganttTasks.length > 0 && (
        <div className='rounded-md border border-zinc-800 bg-zinc-900 overflow-hidden'>
          <ScrollArea className='w-full' style={{ maxHeight: 'calc(100vh - 220px)' }}>
            <div style={{ width: LABEL_COL + gridWidth, minWidth: LABEL_COL + gridWidth }}>
              {/* ── Month header ───────────────────────────────────────────── */}
              <div
                className='flex border-b border-zinc-700 bg-zinc-800'
                style={{ position: 'sticky', top: 0, zIndex: 20, height: HDR_MONTH }}
              >
                {/* Corner cell — sticky left AND sticky top */}
                <div
                  style={{
                    width: LABEL_COL,
                    minWidth: LABEL_COL,
                    position: 'sticky',
                    left: 0,
                    zIndex: 30,
                    background: 'rgb(39 39 42)'
                  }}
                  className='shrink-0 border-r border-zinc-700'
                />
                {/* Month spans */}
                {monthGroups.map((mg, i) => (
                  <div
                    key={i}
                    style={{ width: mg.span * DAY_W, minWidth: mg.span * DAY_W }}
                    className='shrink-0 flex items-center justify-center text-xs font-semibold text-zinc-300 border-r border-zinc-700 last:border-r-0'
                  >
                    {mg.label}
                  </div>
                ))}
              </div>

              {/* ── Day header ─────────────────────────────────────────────── */}
              <div
                className='flex border-b border-zinc-700 bg-zinc-800/90'
                style={{ position: 'sticky', top: HDR_MONTH, zIndex: 20, height: HDR_DAY }}
              >
                {/* Label spacer — sticky left */}
                <div
                  style={{
                    width: LABEL_COL,
                    minWidth: LABEL_COL,
                    position: 'sticky',
                    left: 0,
                    zIndex: 30,
                    background: 'rgb(39 39 42 / 0.9)'
                  }}
                  className='shrink-0 border-r border-zinc-700 flex items-center px-3 text-xs font-medium text-zinc-400'
                >
                  Task
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

              {/* ── Task rows ──────────────────────────────────────────────── */}
              {ganttTasks.map((task, rowIdx) => {
                const colors = statusColor(task.status)
                const left = barLeft(task)
                const width = barWidth(task)
                const rowBg = rowIdx % 2 === 0 ? 'rgb(24 24 27)' : 'rgb(28 28 32)'

                return (
                  <div
                    key={task.id}
                    className='flex border-b border-zinc-800/60 last:border-b-0 hover:brightness-110 transition-all'
                    style={{ height: ROW_H }}
                  >
                    {/* Task label — sticky left */}
                    <div
                      style={{
                        width: LABEL_COL,
                        minWidth: LABEL_COL,
                        position: 'sticky',
                        left: 0,
                        zIndex: 10,
                        background: rowBg
                      }}
                      className='shrink-0 flex items-center gap-2 px-3 border-r border-zinc-700 h-full'
                    >
                      <button type='button' className='flex-1 text-left min-w-0' onClick={() => handleEdit(task)}>
                        <p className='text-xs font-medium text-zinc-100 truncate' title={task.name}>
                          {task.name}
                        </p>
                        <p className='text-[10px] text-zinc-500 truncate mt-0.5'>
                          {task.client ? `${task.client.first_name} ${task.client.last_name}`.trim() : '—'}
                        </p>
                        <p className='text-[10px] text-zinc-600 truncate'>
                          {format(task.startD, 'MMM d')} → {format(task.endD, 'MMM d')}
                        </p>
                      </button>
                      <Badge
                        variant='outline'
                        className={`text-[9px] px-1.5 py-0 capitalize shrink-0 ${colors.bg} ${colors.text} border-0`}
                      >
                        {task.status}
                      </Badge>
                    </div>

                    {/* Grid area */}
                    <div className='relative h-full' style={{ width: gridWidth, background: rowBg }}>
                      {/* Weekend shading */}
                      {days.map((d, i) =>
                        d.getDay() === 0 || d.getDay() === 6 ? (
                          <div
                            key={i}
                            className='absolute inset-y-0 bg-zinc-800/40'
                            style={{ left: i * DAY_W, width: DAY_W }}
                          />
                        ) : null
                      )}

                      {/* Day grid lines */}
                      {days.map((_, i) => (
                        <div
                          key={i}
                          className='absolute inset-y-0 border-r border-zinc-800/40'
                          style={{ left: (i + 1) * DAY_W - 1, width: 1 }}
                        />
                      ))}

                      {/* Today line */}
                      {showToday && (
                        <div
                          className='absolute inset-y-0 w-0.5 bg-blue-400/80 z-10'
                          style={{ left: todayOffset * DAY_W + DAY_W / 2 }}
                        />
                      )}

                      {/* Task bar */}
                      <button
                        type='button'
                        className={[
                          'absolute top-1/2 -translate-y-1/2 rounded-md cursor-pointer hover:opacity-90 active:opacity-75 transition-opacity shadow-sm',
                          colors.bg
                        ].join(' ')}
                        style={{ left: left + 2, width: Math.max(width - 4, DAY_W - 4), height: 32 }}
                        onClick={() => handleEdit(task)}
                        title={`${task.name} · ${format(task.startD, 'MMM d, yyyy')} → ${format(task.endD, 'MMM d, yyyy')}`}
                      >
                        <span className='px-2 text-xs font-medium text-white truncate flex items-center h-full'>
                          {task.name}
                        </span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            <ScrollBar orientation='horizontal' className='mt-1' />
            <ScrollBar orientation='vertical' />
          </ScrollArea>

          {/* Legend */}
          <div className='flex flex-wrap gap-3 px-4 py-2 border-t border-zinc-800 bg-zinc-800/30'>
            {Object.entries(STATUS_COLORS).map(([status, c]) => (
              <div key={status} className='flex items-center gap-1.5'>
                <span className={`inline-block h-3 w-3 rounded-sm ${c.bg}`} />
                <span className='text-[11px] text-zinc-400 capitalize'>{status}</span>
              </div>
            ))}
            <div className='flex items-center gap-1.5 ml-auto'>
              <span className='inline-block h-3 w-px bg-blue-400' />
              <span className='text-[11px] text-zinc-400'>Today</span>
            </div>
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

            setAllTasks(res.data || [])
          } catch {
            // keep current
          }

          setModalOpen(false)
          setSelectedTask(null)
        }}
      />
    </div>
  )
}
