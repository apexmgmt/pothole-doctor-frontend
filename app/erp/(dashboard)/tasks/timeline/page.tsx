import { addDays, format } from 'date-fns'
import ClientService from '@/services/api/clients/clients.service'
import TaskReminderService from '@/services/api/settings/task_reminders.service'
import TaskTypeService from '@/services/api/settings/task_types.service'
import StaffService from '@/services/api/staff.service'
import TaskService from '@/services/api/tasks/tasks.service'
import { Client, Staff, Task, TaskReminder, TaskReminderChannel, TaskType } from '@/types'
import TaskGanttBoard from '@/views/erp/tasks/timeline/TaskGanttBoard'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TaskTimelinePage({ searchParams }: PageProps) {
  const params = await searchParams

  const today = new Date()
  const defaultStart = format(addDays(today, -15), 'yyyy-MM-dd')
  const defaultEnd = format(addDays(today, 15), 'yyyy-MM-dd')

  const sDate = typeof params.starting_date === 'string' ? params.starting_date : defaultStart
  const eDate = typeof params.ending_date === 'string' ? params.ending_date : defaultEnd

  const filters = { starting_date: sDate, ending_date: eDate }

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
    <TaskGanttBoard
      initialTasks={tasks}
      staffs={staffs}
      clients={clients}
      taskTypes={taskTypes}
      taskReminders={taskReminders}
      taskReminderChannels={taskReminderChannels}
    />
  )
}
