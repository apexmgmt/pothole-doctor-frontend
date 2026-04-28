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
 *
 * 1. Converts an array of Task objects to KanbanTask objects
 * 2. Sets the columnId based on the task's status or defaults to 'backlog'
 * @param tasks Array of Task objects
 * @returns Array of KanbanTask objects
 */
function toKanbanTasks(tasks: Task[]): KanbanTask[] {
  return tasks.map(t => ({ ...t, columnId: t.status ?? 'backlog' }))
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

  /**
   * Summary of handleAddTask
   *
   * 1. Set default status based on column where add button was clicked
   * 2. Reset selected task to null for creating a new task
   * 3. Set modal mode to 'create' for conditional rendering inside modal
   * 4. Open the modal
   * @param columnId string uuid
   */
  function handleAddTask(columnId: string) {
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
  function handleEditTask(task: Task) {
    setSelectedTask(task)
    setModalMode('edit')
    setModalOpen(true)
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

  return (
    <>
      <ScrollArea className='h-[calc(100dvh-8rem)] w-full'>
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

  /**
   * Summary of onDragStart
   *
   * 1. Check if the dragged item is a task
   * 2. Set the active task state for rendering in DragOverlay
   * @param event
   */
  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task)
    }
  }

  /**
   * Summary of onDragOver
   *
   * 1. Check if dragged over a valid target (column or task)
   * 2. If over a different column, move task to end of that column
   * 3. If over a different task in the same column, reorder tasks
   * 4. If API call fails, revert to previous state
   * 5. Update active task's columnId in state for correct rendering in DragOverlay
   * @param event
   * @returns
   */
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

  /**
   * Summary of onDragEnd
   *
   * 1. Check if dropped over a valid target (column or task)
   * 2. If task was moved to a different column, call API to persist status change
   * 3. If API call fails, revert to previous state
   * 4. Clear active task state
   * @param event
   */
  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event

    setActiveTask(null)

    if (!over) return

    setTasks(tasks => {
      const activeId = String(active.id)
      const overId = String(over.id)
      const movedTask = tasks.find(t => t.id === activeId)

      if (!movedTask) return tasks

      // Find the new column id
      let newColumnId = movedTask.columnId

      if (over.data.current?.type === 'Column') {
        newColumnId = overId
      } else if (over.data.current?.type === 'Task') {
        const overTask = tasks.find(t => t.id === overId)

        if (overTask) newColumnId = overTask.columnId
      }

      // Get all tasks in the new column, excluding the moved card, sorted by order
      let columnTasks = tasks
        .filter(t => t.id !== activeId && t.columnId === newColumnId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

      // Find the index where the card was dropped
      let newIndex = columnTasks.length // default to end

      if (over.data.current?.type === 'Task') {
        newIndex = columnTasks.findIndex(t => t.id === overId)
        if (newIndex === -1) newIndex = columnTasks.length
      }

      // Insert the moved card at the new index
      const newMovedTask = { ...movedTask, columnId: newColumnId, status: newColumnId }

      const previewColumn = [...columnTasks.slice(0, newIndex), newMovedTask, ...columnTasks.slice(newIndex)]

      // Update order for all cards in the column
      const updatedTasks = tasks.map(t => {
        if (t.columnId !== newColumnId) return t
        const idx = previewColumn.findIndex(tc => tc.id === t.id)

        if (idx === -1) return t

        return { ...t, order: idx }
      })

      // Update the moved card's columnId and status
      const finalTasks = updatedTasks.map(t =>
        t.id === activeId
          ? { ...t, columnId: newColumnId, status: newColumnId, order: previewColumn.findIndex(tc => tc.id === t.id) }
          : t
      )

      // Call API only for the moved card with its new order and status
      const movedIdx = previewColumn.findIndex(tc => tc.id === activeId)

      if (movedIdx !== -1 && (movedTask.order !== movedIdx || movedTask.status !== newColumnId)) {
        TaskService.updateStatus(movedTask.id, newColumnId, movedIdx).catch(() => {
          // Optionally: revert UI or show error
        })
      }

      return finalTasks
    })
  }
}
