import ClientService from '@/services/api/clients/clients.service'
import TaskReminderService from '@/services/api/settings/task_reminders.service'
import TaskTypeService from '@/services/api/settings/task_types.service'
import StaffService from '@/services/api/staff.service'
import TaskService from '@/services/api/tasks.service'
import { Client, Staff, Task, TaskReminder, TaskReminderChannel, TaskType } from '@/types'
import KanbanBoard from '@/views/erp/tasks/kanban/KanbanBoard'

export const dynamic = 'force-dynamic'

export default async function TaskKanbanPage() {
  const [tasksRes, staffsRes, clientsRes, taskTypesRes, taskRemindersRes, taskReminderChannelsRes] =
    await Promise.allSettled([
      TaskService.getAll(),
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
