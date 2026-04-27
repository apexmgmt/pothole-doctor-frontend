import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CalendarIcon, MapPinIcon, PencilIcon } from 'lucide-react'
import { Task } from '@/types'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
}

function getInitials(first?: string, last?: string): string {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?'
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''

  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'In Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'Task', task },
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  const employees = task.employees ?? []

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'opacity-0' : undefined}
    >
      <Card className='cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-primary/50 bg-card'>
        <CardContent className='p-3 space-y-2'>
          {/* Header: task type badge + status + edit button */}
          <div className='flex items-start justify-between gap-2'>
            <div className='flex flex-wrap gap-1'>
              {task.task_type?.name && (
                <span className='text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20'>
                  {task.task_type.name}
                </span>
              )}
              {/* {task.status && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[task.status] ?? 'bg-muted text-muted-foreground'}`}
                >
                  {task.status}
                </span>
              )} */}
            </div>

            {onEdit && (
              <button
                type='button'
                onPointerDown={e => e.stopPropagation()}
                onClick={e => {
                  e.stopPropagation()
                  onEdit(task)
                }}
                className='shrink-0 text-muted-foreground hover:text-foreground transition-colors'
              >
                <PencilIcon className='h-3.5 w-3.5' />
              </button>
            )}
          </div>

          {/* Task name */}
          <p className='text-sm font-medium leading-snug'>{task.name}</p>

          {/* Client */}
          {task.client && (
            <p className='text-xs text-muted-foreground truncate'>
              {[task.client.first_name, task.client.last_name].filter(Boolean).join(' ')}
            </p>
          )}

          {/* Date + location row */}
          <div className='flex items-center gap-3 text-xs text-muted-foreground'>
            {task.start_date && (
              <span className='flex items-center gap-1'>
                <CalendarIcon className='h-3 w-3 shrink-0' />
                {formatDate(task.start_date)}
                {task.end_date && task.end_date !== task.start_date && (
                  <> - {formatDate(task.end_date)}</>
                )}
              </span>
            )}
            {task.location && (
              <span className='flex items-center gap-1 truncate'>
                <MapPinIcon className='h-3 w-3 shrink-0' />
                <span className='truncate max-w-[110px]'>{task.location}</span>
              </span>
            )}
          </div>

          {/* Assignee avatars */}
          {employees.length > 0 && (
            <TooltipProvider delayDuration={100}>
              <div className='flex items-center -space-x-2'>
                {employees.slice(0, 4).map(emp => (
                  <Tooltip key={emp.id}>
                    <TooltipTrigger asChild>
                      <Avatar className='h-6 w-6'>
                        <AvatarFallback className='text-[10px]'>
                          {getInitials(emp.first_name, emp.last_name)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side='top' className='text-xs'>
                      {emp.first_name} {emp.last_name}
                    </TooltipContent>
                  </Tooltip>
                ))}
                {employees.length > 4 && (
                  <Avatar className='h-6 w-6'>
                    <AvatarFallback className='text-[10px] bg-muted text-muted-foreground'>
                      +{employees.length - 4}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
