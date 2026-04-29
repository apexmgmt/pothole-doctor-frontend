import ClientService from '@/services/api/clients/clients.service'
import TaskReminderService from '@/services/api/settings/task_reminders.service'
import TaskTypeService from '@/services/api/settings/task_types.service'
import StaffService from '@/services/api/staff.service'
import TaskService from '@/services/api/tasks.service'
import { Client, Staff, Task, TaskReminder, TaskReminderChannel, TaskType } from '@/types'
import KanbanBoard from '@/views/erp/tasks/kanban/KanbanBoard'

export const dynamic = 'force-dynamic'

/**
 * Summary of TaskKanbanPage
 * 1. Receives searchParams directly from the Next.js Page props
 * 2. Passes filters to TaskService.getAll() to fetch correct initial data server-side
 * 3. Prevents UI flickering by ensuring the server-rendered HTML matches the filter state
 */
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TaskKanbanPage({ searchParams }: PageProps) {
  // Await the searchParams promise
  const params = await searchParams

  // Extract and validate potential filter values
  const sDate = typeof params.starting_date === 'string' ? params.starting_date : null
  const eDate = typeof params.ending_date === 'string' ? params.ending_date : null

  /**
   * Construct the filter object only if values exist.
   * We use 'undefined' as the fallback so TaskService.getAll()
   * receives nothing if no filters are present.
   */
  const filters =
    sDate || eDate
      ? {
          ...(sDate && { starting_date: sDate }),
          ...(eDate && { ending_date: eDate })
        }
      : undefined

  // Fire the requests
  const [tasksRes, staffsRes, clientsRes, taskTypesRes, taskRemindersRes, taskReminderChannelsRes] =
    await Promise.allSettled([
      TaskService.getAll(filters),
      StaffService.getAll(),
      ClientService.getAll('customer'),
      TaskTypeService.getAll(),
      TaskReminderService.index(),
      TaskReminderService.getReminderChannels()
    ])

  const tasks: Task[] = tasksRes.status === 'fulfilled' ? tasksRes.value.data || [] : []
  const staffs: Staff[] = staffsRes.status === 'fulfilled' ? staffsRes.value.data || [] : []
  const clients: Client[] = clientsRes.status === 'fulfilled' ? clientsRes.value.data || [] : []
  const taskTypes: TaskType[] = taskTypesRes.status === 'fulfilled' ? taskTypesRes.value.data || [] : []
  const taskReminders: TaskReminder[] = taskRemindersRes.status === 'fulfilled' ? taskRemindersRes.value.data || [] : []

  const taskReminderChannels: TaskReminderChannel[] =
    taskReminderChannelsRes.status === 'fulfilled' ? taskReminderChannelsRes.value.data || [] : []

  return (
    <KanbanBoard
      initialTasks={tasks}
      staffs={staffs}
      clients={clients}
      taskTypes={taskTypes}
      taskReminders={taskReminders}
      taskReminderChannels={taskReminderChannels}
    />
  )
}
