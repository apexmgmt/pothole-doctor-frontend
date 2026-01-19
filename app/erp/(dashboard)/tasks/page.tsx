import ClientService from '@/services/api/clients/clients.service'
import TaskReminderService from '@/services/api/settings/task_reminders.service'
import TaskTypeService from '@/services/api/settings/task_types.service'
import StaffService from '@/services/api/staff.service'
import { Client, Staff, TaskReminder, TaskReminderChannel, TaskType } from '@/types'
import Tasks from '@/views/erp/tasks/Tasks'

export default async function TasksPage() {
  let staffs: Staff[] = []
  let clients: Client[] = []
  let taskTypes: TaskType[] = []
  let taskReminders: TaskReminder[] = []
  let taskReminderChannels: TaskReminderChannel[] = []

  // fetch staffs
  try {
    const response = await StaffService.getAll()

    staffs = response.data || []
  } catch (error) {
    staffs = []
  }

  // fetch clients type=customer
  try {
    const response = await ClientService.getAll('customer')

    clients = response.data || []
  } catch (error) {
    clients = []
  }

  // fetch task types
  try {
    const response = await TaskTypeService.getAll()

    taskTypes = response.data || []
  } catch (error) {
    taskTypes = []
  }

  // fetch task reminders
  try {
    const response = await TaskReminderService.index()

    taskReminders = response.data || []
  } catch (error) {
    taskReminders = []
  }

  // fetch task reminder channels
  try {
    const response = await TaskReminderService.getReminderChannels()

    taskReminderChannels = response.data || []
  } catch (error) {
    taskReminderChannels = []
  }

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
