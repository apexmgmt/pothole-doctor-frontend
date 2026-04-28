'use client'

import { useEffect, useState } from 'react'
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
  pointerWithin
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Client, Staff, Task, TaskReminder, TaskReminderChannel, TaskType } from '@/types'
import { TaskCard } from './TaskCard'
import TaskService from '@/services/api/tasks.service'
import CreateOrEditTaskModal from '@/views/erp/tasks/CreateOrEditTaskModal'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { KanbanColumn as Column, KanbanTask } from './kanban'
import KanbanColumn from './KanbanColumn'
import { toast } from 'sonner'
import { hasPermission } from '@/utils/role-permission'

/**
 * Summary of COLUMNS constant
 *
 * 1. Defines the columns for the Kanban board
 * 2. Each column has an id and a label
 */
const COLUMNS: Column[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'to-do', label: 'To Do' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' }
]

/**
 * Summary of toKanbanTasks function
 * 1. Converts an array of Task objects to KanbanTask objects
 * 2. Pre-sorts the array so our visual flat array acts correctly
 */
function toKanbanTasks(tasks: Task[]): KanbanTask[] {
  return tasks.map(t => ({ ...t, columnId: t.status ?? 'backlog' })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

/**
 * Summary of KanbanBoard component
 *
 * 1. Initializes state for tasks, active task, and modal management
 * 2. Handles adding and editing tasks
 * 3. Sets up drag-and-drop context with sensors
 * 4. Renders columns and tasks
 */
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
  const [defaultStatus, setDefaultStatus] = useState<string>('backlog')
  const [canCreateTask, setCanCreateTask] = useState<boolean>(false)
  const [canEditTask, setCanEditTask] = useState<boolean>(false)
  const [canDeleteTask, setCanDeleteTask] = useState<boolean>(false)

  // check permissions from cookies and set state accordingly
  useEffect(() => {
    // Check permissions
    hasPermission('Create Task').then(result => setCanCreateTask(result))
    hasPermission('Update Task').then(result => setCanEditTask(result))
    hasPermission('Delete Task').then(result => setCanDeleteTask(result))
  }, [])

  /**
   * Summary of handleAddTask
   *
   * 1. Set default status based on column where add button was clicked
   * 2. Reset selected task to null for creating a new task
   * 3. Set modal mode to 'create' for conditional rendering inside modal
   * 4. Open the modal
   * @param columnId string uuid
   */
  const handleAddTask = (columnId: string) => {
    setDefaultStatus(columnId)
    setSelectedTask(null)
    setModalMode('create')
    setModalOpen(true)
  }

  /**
   * Summary of handleEditTask
   *
   * 1. Set selected task for pre-filling the form
   * 2. Set modal mode to 'edit' for conditional rendering inside modal
   * 3. Open the modal
   * @param task Task object to be edited
   */
  const handleEditTask = async (task: Task) => {
    try {
      TaskService.show(task.id)
        .then(response => {
          setSelectedTask(response.data)
          setModalMode('edit')
          setModalOpen(true)
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch task details')
        })
    } catch (error) {
      toast.error('Something went wrong while fetching the task details!')
    }
  }

  /**
   * Summary of useSensors setup
   *
   * 1. PointerSensor with a small activation distance to prevent accidental drags
   * 2. KeyboardSensor with default coordinate getter for accessibility
   * @returns {Array} Array of sensors for DndContext
   */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  /**
   * Summary of onDragStart
   *
   * 1. Check if the dragged item is a task
   * 2. Set the active task state for rendering in DragOverlay
   * @param event
   */
  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task)
    }
  }

  /**
   * Summary of onDragOver
   * Moves task across arrays & instantly calculates new orders locally (0, 1, 2...)
   * preventing jumping and blinking.
   */
  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'

    if (!isActiveTask) return

    setTasks(tasks => {
      const activeIndex = tasks.findIndex(t => t.id === activeId)
      const overIndex = tasks.findIndex(t => t.id === overId)

      if (activeIndex === -1) return tasks
      const activeTask = tasks[activeIndex]

      const isOverColumn = over.data.current?.type === 'Column'
      const isOverTask = over.data.current?.type === 'Task'

      let targetColumnId: string

      if (isOverColumn) {
        targetColumnId = overId
      } else if (isOverTask) {
        const overTask = tasks[overIndex]

        if (!overTask) return tasks
        targetColumnId = overTask.columnId
      } else {
        return tasks
      }

      // If moving inside the same column
      if (activeTask.columnId === targetColumnId) {
        if (activeIndex !== overIndex && overIndex !== -1) {
          let newTasks = arrayMove(tasks, activeIndex, overIndex)

          // Recalculate +1 order for the column instantly
          const colTasks = newTasks.filter(t => t.columnId === targetColumnId)

          return newTasks.map(t =>
            t.columnId === targetColumnId ? { ...t, order: colTasks.findIndex(ct => ct.id === t.id) } : t
          )
        }

        return tasks
      }

      // If moving to a DIFFERENT column
      let newTasks = [...tasks]
      const sourceColumnId = activeTask.columnId

      // Remove from old location
      newTasks.splice(activeIndex, 1)
      const movedTask = { ...activeTask, columnId: targetColumnId }

      // Insert at exact overIndex in the target column
      if (isOverTask && overIndex !== -1) {
        const newOverIndex = newTasks.findIndex(t => t.id === overId)

        newTasks.splice(newOverIndex >= 0 ? newOverIndex : newTasks.length, 0, movedTask)
      } else {
        newTasks.push(movedTask)
      }

      // Recalculate orders locally for both source and target columns
      ;[sourceColumnId, targetColumnId].forEach(colId => {
        const colTasks = newTasks.filter(t => t.columnId === colId)

        newTasks = newTasks.map(t =>
          t.columnId === colId ? { ...t, order: colTasks.findIndex(ct => ct.id === t.id) } : t
        )
      })

      return newTasks
    })
  }

  /**
   * Summary of onDragEnd
   * Drops the card into final location and issues API call with exact pre-calculated Order
   */
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveTask(null)
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    setTasks(tasks => {
      const activeTask = tasks.find(t => t.id === activeId)

      if (!activeTask) return tasks

      const targetColumnId = activeTask.columnId
      let newTasks = [...tasks]

      // Double-check reorder if dropped wildly
      const activeIndex = newTasks.findIndex(t => t.id === activeId)
      const overIndex = newTasks.findIndex(t => t.id === overId)
      const overTask = newTasks.find(t => t.id === overId)

      if (overTask && activeTask.columnId === overTask.columnId && activeIndex !== overIndex && overIndex !== -1) {
        newTasks = arrayMove(newTasks, activeIndex, overIndex)
      }

      // Finalize Status and Order sequence accurately
      const colTasks = newTasks.filter(t => t.columnId === targetColumnId)

      newTasks = newTasks.map(t => {
        if (t.columnId === targetColumnId) {
          return { ...t, order: colTasks.findIndex(ct => ct.id === t.id), status: targetColumnId }
        }

        return t
      })

      const finalMovedTask = newTasks.find(t => t.id === activeId)
      const originalTask = active.data.current?.task as Task

      // Call API ONLY if column or order has actually changed vs original state
      if (finalMovedTask && originalTask) {
        if (originalTask.status !== finalMovedTask.status || originalTask.order !== finalMovedTask.order) {
          TaskService.updateStatus(finalMovedTask.id, finalMovedTask.status, finalMovedTask.order).catch(() => {
            // Handle rollback UI here if needed
          })
        }
      }

      return newTasks
    })
  }

  return (
    <>
      <ScrollArea className='w-full'>
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className='flex h-[calc(100dvh-8rem)] w-full min-w-full gap-4 p-4'>
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.id}
                col={col}
                tasks={tasks.filter(t => t.columnId === col.id)}
                onAddTask={handleAddTask}
                onEdit={handleEditTask}
                canCreateTask={canCreateTask}
                canEditTask={canEditTask}
                canDeleteTask={canDeleteTask}
              />
            ))}
          </div>

          <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
        </DndContext>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>

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
}
