import ClientService from '@/services/api/clients/clients.service'
import TaskReminderService from '@/services/api/settings/task_reminders.service'
import TaskTypeService from '@/services/api/settings/task_types.service'
import StaffService from '@/services/api/staff.service'
import { Client, Staff, TaskReminder, TaskReminderChannel, TaskType } from '@/types'
import Tasks from '@/views/erp/tasks/Tasks'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  const [staffsRes, clientsRes, taskTypesRes, taskRemindersRes, taskReminderChannelsRes] = await Promise.allSettled([
    StaffService.getAll(),
    ClientService.getAll('customer'),
    TaskTypeService.getAll(),
    TaskReminderService.index(),
    TaskReminderService.getReminderChannels()
  ])

  const staffs: Staff[] = staffsRes.status === 'fulfilled' ? staffsRes.value.data || [] : []
  const clients: Client[] = clientsRes.status === 'fulfilled' ? clientsRes.value.data || [] : []
  const taskTypes: TaskType[] = taskTypesRes.status === 'fulfilled' ? taskTypesRes.value.data || [] : []
  const taskReminders: TaskReminder[] = taskRemindersRes.status === 'fulfilled' ? taskRemindersRes.value.data || [] : []
  const taskReminderChannels: TaskReminderChannel[] =
    taskReminderChannelsRes.status === 'fulfilled' ? taskReminderChannelsRes.value.data || [] : []

  return (
    <Tasks
      staffs={staffs}
      clients={clients}
      taskTypes={taskTypes}
      taskReminders={taskReminders}
      taskReminderChannels={taskReminderChannels}
    />
  )
}
