import TaskReminderService from '@/services/api/settings/task_reminders.service'
import TaskTypeService from '@/services/api/settings/task_types.service'
import { TaskReminder, TaskReminderChannel, TaskReminderTime, TaskType } from '@/types'
import TaskReminders from '@/views/erp/settings/task-reminders/TaskReminders'

export const dynamic = 'force-dynamic'

export default async function TaskRemindersPage() {
  const [taskRemindersRes, taskTypesRes, reminderChannelsRes] = await Promise.allSettled([
    TaskReminderService.index(),
    TaskTypeService.getAll(),
    TaskReminderService.getReminderChannels()
  ])

  const taskReminders: TaskReminder[] = taskRemindersRes.status === 'fulfilled' ? taskRemindersRes.value.data || [] : []
  const taskTypes: TaskType[] = taskTypesRes.status === 'fulfilled' ? taskTypesRes.value.data || [] : []

  const reminderChannels: TaskReminderChannel[] =
    reminderChannelsRes.status === 'fulfilled' ? reminderChannelsRes.value.data || [] : []

  return <TaskReminders taskReminders={taskReminders} taskTypes={taskTypes} reminderChannels={reminderChannels} />
}
