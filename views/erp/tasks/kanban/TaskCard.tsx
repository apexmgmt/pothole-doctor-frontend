import { useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CalendarIcon, MapPinIcon, PencilIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Staff, Task } from '@/types'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onView?: (taskId: string) => void
  canEdit: boolean
  canDelete: boolean
  isOverlay?: boolean
}

function getInitials(first?: string, last?: string): string {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?'
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''

  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

import { Trash2Icon } from 'lucide-react'
import { generateFileUrl } from '@/utils/utility'

export function TaskCard({ task, onEdit, onDelete, onView, canEdit, canDelete, isOverlay = false }: TaskCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'Task', task },
    disabled: isOverlay
  })

  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const movedRef = useRef(false)

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isOverlay) return

    listeners?.onPointerDown?.(event)

    pointerStartRef.current = { x: event.clientX, y: event.clientY }
    movedRef.current = false
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current || movedRef.current) return

    const dx = Math.abs(event.clientX - pointerStartRef.current.x)
    const dy = Math.abs(event.clientY - pointerStartRef.current.y)

    if (dx > 1 || dy > 1) {
      movedRef.current = true
    }
  }

  const handlePointerUp = () => {
    pointerStartRef.current = null
  }

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isOverlay || !onView || isDragging || movedRef.current) return

    event.stopPropagation()
    onView(task.id)
  }

  const employees = task.employees ?? []

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      className={isDragging ? 'opacity-0' : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleCardClick}
    >
      <Card className='cursor-grab active:cursor-grabbing bg-card'>
        <CardContent className='p-3 space-y-2'>
          {/* Header: task type badge + status + edit button */}
          <div className='flex items-start justify-between gap-2'>
            <div className='flex flex-wrap gap-1'>
              {task.task_type?.name && (
                <span className='text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20'>
                  {task.task_type.name}
                </span>
              )}
            </div>

            <div className='flex gap-1'>
              {canEdit && onEdit && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => {
                    e.stopPropagation()
                    onEdit(task)
                  }}
                  tabIndex={0}
                  aria-label='Edit task'
                >
                  <PencilIcon className='h-3.5 w-3.5' />
                </Button>
              )}
              {canDelete && onDelete && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => {
                    e.stopPropagation()
                    onDelete(task.id)
                  }}
                  tabIndex={0}
                  aria-label='Delete task'
                >
                  <Trash2Icon className='h-3.5 w-3.5 text-destructive' />
                </Button>
              )}
            </div>
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
                {task.end_date && task.end_date !== task.start_date && <> - {formatDate(task.end_date)}</>}
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
                {employees.slice(0, 4).map((emp: Staff) => (
                  <Tooltip key={emp.id}>
                    <TooltipTrigger asChild>
                      <Avatar className='h-6 w-6'>
                        <AvatarImage src={generateFileUrl(emp?.userable?.profile_picture) || undefined} alt={`${emp.first_name} ${emp.last_name}`} />
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
