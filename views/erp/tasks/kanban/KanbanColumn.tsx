import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Task } from '@/types'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { PlusIcon } from 'lucide-react'
import { TaskCard } from './TaskCard'
import { KanbanColumn as Column, KanbanTask } from './kanban'

/**
 * Summary of KanbanColumn component
 *
 * 1. Sets up a droppable area for tasks
 * 2. Renders the column header with task count and add button
 * 3. Renders the list of tasks within the column
 */
export default function KanbanColumn({
  col,
  tasks,
  onAddTask,
  onEdit,
  canCreateTask,
  canEditTask,
  canDeleteTask
}: {
  col: Column
  tasks: KanbanTask[]
  onAddTask: (columnId: string) => void
  onEdit: (task: Task) => void
  canCreateTask: boolean
  canEditTask: boolean
  canDeleteTask: boolean
}) {
  const { setNodeRef } = useDroppable({ id: col.id, data: { type: 'Column', columnId: col.id } })

  // Sort tasks visually based on the recalculated order
  const sortedTasks = [...tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full flex-col w-[350px] min-w-[350px] rounded-xl p-4 transition-colors bg-accent/30 `}
    >
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-semibold text-lg'>{col.label}</h3>
        <div className='flex items-center gap-2'>
          <span className='text-sm bg-accent px-2 py-1 rounded-full'>{sortedTasks.length}</span>
          {canCreateTask && (
            <Button
              size='icon'
              variant='ghost'
              className='h-7 w-7'
              onPointerDown={e => e.stopPropagation()}
              onClick={() => onAddTask(col.id)}
            >
              <PlusIcon className='h-4 w-4' />
            </Button>
          )}
        </div>
      </div>

      <div className='min-h-0 flex-1'>
        <ScrollArea className='h-full'>
          <div className='flex flex-col gap-3 pr-1'>
            {/* Added strategy for smoother vertical sorting physics */}
            <SortableContext items={sortedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {sortedTasks.map(task => (
                <TaskCard key={task.id} task={task} onEdit={onEdit} canEdit={canEditTask} canDelete={canDeleteTask} />
              ))}
            </SortableContext>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
