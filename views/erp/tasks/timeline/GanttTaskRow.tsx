import { format } from 'date-fns'
import { Task } from '@/types'
import { Badge } from '@/components/ui/badge'

// ─── Status colours ──────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  backlog: { bg: 'bg-slate-600', text: 'text-white' },
  'to-do': { bg: 'bg-blue-600', text: 'text-white' },
  overdue: { bg: 'bg-red-600', text: 'text-white' },
  'in-progress': { bg: 'bg-yellow-500', text: 'text-white' },
  completed: { bg: 'bg-emerald-600', text: 'text-white' },
  cancelled: { bg: 'bg-zinc-600', text: 'text-white' }
}

const statusColor = (status: string) => STATUS_COLORS[status] ?? { bg: 'bg-zinc-700', text: 'text-white' }

export interface GanttTask extends Task {
  startD: Date
  endD: Date
}

interface GanttTaskRowProps {
  task: GanttTask
  rowIdx: number
  labelCol: number
  gridWidth: number
  dayW: number
  rowH: number
  days: Date[]
  barLeft: number
  barWidth: number
  todayOffset: number
  showToday: boolean
  onEdit: (task: Task) => void
}

export default function GanttTaskRow({
  task,
  rowIdx,
  labelCol,
  gridWidth,
  dayW,
  rowH,
  days,
  barLeft,
  barWidth,
  todayOffset,
  showToday,
  onEdit
}: GanttTaskRowProps) {
  const colors = statusColor(task.status)
  const rowBg = rowIdx % 2 === 0 ? 'rgb(24 24 27)' : 'rgb(28 28 32)'

  return (
    <div
      className='flex border-b border-zinc-800/60 last:border-b-0 hover:brightness-110 transition-all'
      style={{ height: rowH }}
    >
      {/* Task label — sticky left */}
      <div
        style={{ width: labelCol, minWidth: labelCol, position: 'sticky', left: 0, zIndex: 10, background: rowBg }}
        className='shrink-0 flex items-center gap-2 px-3 border-r border-zinc-700 h-full'
      >
        <button type='button' className='flex-1 text-left min-w-0' onClick={() => onEdit(task)}>
          <p className='text-base font-medium text-zinc-100 truncate' title={task.name}>
            {task.name}
          </p>
          <p className='text-xs text-zinc-500 truncate mt-0.5'>
            {task.client ? `${task.client.first_name} ${task.client.last_name}`.trim() : '—'}
          </p>
          <p className='text-xs text-zinc-600 truncate'>
            {format(task.startD, 'MMM d')} – {format(task.endD, 'MMM d')}
          </p>
        </button>
        <Badge
          variant='outline'
          className={`text-xs px-1.5 py-0 capitalize shrink-0 ${colors.bg} ${colors.text} border-0`}
        >
          {task.status}
        </Badge>
      </div>

      {/* Grid area */}
      <div className='relative h-full' style={{ width: gridWidth, background: rowBg }}>
        {/* Weekend shading */}
        {days.map((d, i) =>
          d.getDay() === 0 || d.getDay() === 6 ? (
            <div key={i} className='absolute inset-y-0 bg-zinc-800/40' style={{ left: i * dayW, width: dayW }} />
          ) : null
        )}

        {/* Day grid lines */}
        {days.map((_, i) => (
          <div
            key={i}
            className='absolute inset-y-0 border-r border-zinc-800/40'
            style={{ left: (i + 1) * dayW - 1, width: 1 }}
          />
        ))}

        {/* Today line */}
        {showToday && (
          <div
            className='absolute inset-y-0 w-0.5 bg-blue-400/80 z-10'
            style={{ left: todayOffset * dayW + dayW / 2 }}
          />
        )}

        {/* Task bar — pill shape */}
        <button
          type='button'
          className={[
            'absolute top-1/2 -translate-y-1/2 rounded-full cursor-pointer hover:opacity-90 active:opacity-75 transition-opacity shadow-sm',
            colors.bg
          ].join(' ')}
          style={{ left: barLeft + 4, width: Math.max(barWidth - 8, dayW - 8), height: 30 }}
          onClick={() => onEdit(task)}
          title={`${task.name} · ${format(task.startD, 'MMM d, yyyy')} → ${format(task.endD, 'MMM d, yyyy')}`}
        >
          <span className='px-3 text-xs font-medium text-white truncate flex items-center h-full'>{task.name}</span>
        </button>
      </div>
    </div>
  )
}
