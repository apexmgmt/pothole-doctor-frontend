import TaskReminderService from '@/services/api/settings/task_reminders.service'
import TaskTypeService from '@/services/api/settings/task_types.service'
import { TaskReminder, TaskReminderChannel, TaskReminderTime, TaskType } from '@/types'
import TaskReminders from '@/views/erp/settings/task-reminders/TaskReminders'

export default async function TaskRemindersPage() {
  let taskReminders: TaskReminder[] = []
  let taskTypes: TaskType[] = []
  let reminderChannels: TaskReminderChannel[] = []

  try {
    const response = await TaskReminderService.index()
    taskReminders = response.data || []
  } catch (error) {
    taskReminders = []
  }
  try {
    const response = await TaskTypeService.getAllTaskType()
    taskTypes = response.data || []
  } catch (error) {
    taskTypes = []
  }

  try {
    const response = await TaskReminderService.getReminderChannels()
    reminderChannels = response.data || []
  } catch (error) {
    reminderChannels = []
  }


  return (
    <TaskReminders
      taskReminders={taskReminders}
      taskTypes={taskTypes}
      reminderChannels={reminderChannels}
    />
  )
}
