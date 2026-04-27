'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useDroppable,
  pointerWithin
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Client, Staff, Task, TaskReminder, TaskReminderChannel, TaskType } from '@/types'
import { TaskCard } from './TaskCard'
import TaskService from '@/services/api/tasks.service'
import CreateOrEditTaskModal from '@/views/erp/tasks/CreateOrEditTaskModal'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'

interface KanbanColumn {
  id: string
  label: string
}

const COLUMNS: KanbanColumn[] = [
  { id: 'Pending', label: 'Pending' },
  { id: 'In Progress', label: 'In Progress' },
  { id: 'Completed', label: 'Completed' },
  { id: 'Cancelled', label: 'Cancelled' }
]

interface KanbanTask extends Task {
  columnId: string
}

function toKanbanTasks(tasks: Task[]): KanbanTask[] {
  return tasks.map(t => ({ ...t, columnId: t.status ?? 'Pending' }))
}

function DroppableColumn({
  col,
  tasks,
  onAddTask,
  onEdit
}: {
  col: KanbanColumn
  tasks: KanbanTask[]
  onAddTask: (columnId: string) => void
  onEdit: (task: Task) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id, data: { type: 'Column', columnId: col.id } })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[350px] min-w-[350px] rounded-xl p-4 transition-colors ${isOver ? 'bg-accent/60' : 'bg-accent/30'}`}
    >
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-semibold text-lg'>{col.label}</h3>
        <div className='flex items-center gap-2'>
          <span className='text-sm bg-accent px-2 py-1 rounded-full'>{tasks.length}</span>
          <Button
            size='icon'
            variant='ghost'
            className='h-7 w-7'
            onPointerDown={e => e.stopPropagation()}
            onClick={() => onAddTask(col.id)}
          >
            <PlusIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='flex flex-col gap-3 grow min-h-[150px]'>
        <SortableContext items={tasks.map(t => t.id)}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

export default function KanbanBoard({
  initialTasks = [],
  staffs = [],
  clients = [],
  taskTypes = [],
  taskReminders = [],
  taskReminderChannels = []
}: {
  initialTasks?: Task[]
  staffs?: Staff[]
  clients?: Client[]
  taskTypes?: TaskType[]
  taskReminders?: TaskReminder[]
  taskReminderChannels?: TaskReminderChannel[]
}) {
  const [tasks, setTasks] = useState<KanbanTask[]>(toKanbanTasks(initialTasks))
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<string>('Pending')

  function handleAddTask(columnId: string) {
    setDefaultStatus(columnId)
    setSelectedTask(null)
    setModalMode('create')
    setModalOpen(true)
  }

  function handleEditTask(task: Task) {
    setSelectedTask(task)
    setModalMode('edit')
    setModalOpen(true)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  return (
    <>
      <div className='flex h-full w-full gap-4 p-4 overflow-x-auto'>
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          {COLUMNS.map(col => (
            <DroppableColumn
              key={col.id}
              col={col}
              tasks={tasks.filter(t => t.columnId === col.id)}
              onAddTask={handleAddTask}
              onEdit={handleEditTask}
            />
          ))}

          <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
        </DndContext>
      </div>

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
            const fresh = res.data || []

            setTasks(toKanbanTasks(fresh))
          } catch {
            // Keep current state on fetch failure
          }

          setModalOpen(false)
          setSelectedTask(null)
        }}
      />
    </>
  )

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task)
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event

    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    if (activeId === overId) return

    const isOverColumn = over.data.current?.type === 'Column'
    const isOverTask = over.data.current?.type === 'Task'

    setTasks(tasks => {
      const activeIndex = tasks.findIndex(t => t.id === activeId)

      if (activeIndex === -1) return tasks

      // Determine the target column id
      let targetColumnId: string

      if (isOverColumn) {
        targetColumnId = overId
      } else if (isOverTask) {
        const overIndex = tasks.findIndex(t => t.id === overId)

        if (overIndex === -1) return tasks

        targetColumnId = tasks[overIndex].columnId

        // Same column — reorder in place
        if (tasks[activeIndex].columnId === targetColumnId) {
          return arrayMove(tasks, activeIndex, overIndex)
        }
      } else {
        return tasks
      }

      // Move to new column (place at end)
      const updated = tasks.filter(t => t.id !== activeId)
      const moved = { ...tasks[activeIndex], columnId: targetColumnId }

      if (isOverTask) {
        const overIndex = updated.findIndex(t => t.id === overId)

        updated.splice(overIndex, 0, moved)
      } else {
        updated.push(moved)
      }

      return updated
    })
  }

  function onDragEnd(event: DragEndEvent) {
    const { active } = event

    setActiveTask(null)

    // Persist the status change — read final columnId from state
    setTasks(tasks => {
      const task = tasks.find(t => t.id === String(active.id))

      if (task && task.columnId !== task.status) {
        TaskService.update(task.id, {
          client_id: task.client_id,
          task_type_id: task.task_type_id,
          name: task.name,
          employee_ids: task.employees?.map(e => e.id) ?? [],
          sms_reminder: task.sms_reminder,
          email_reminder: task.email_reminder,
          start_date: task.start_date,
          start_time: task.start_time,
          end_date: task.end_date,
          end_time: task.end_time,
          location: task.location,
          comment: task.comment,
          completed_date: task.completed_date ?? '',
          close_comment: task.close_comment ?? '',
          status: task.columnId,
          reminders: []
        }).catch(() => {
          // Revert on API failure
          setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, columnId: task.status } : t)))
        })
      }

      return tasks
    })
  }
}
