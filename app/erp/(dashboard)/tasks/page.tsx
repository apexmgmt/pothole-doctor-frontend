import ClientService from '@/services/api/clients/clients.service'
import TaskReminderService from '@/services/api/settings/task_reminders.service'
import TaskTypeService from '@/services/api/settings/task_types.service'
import StaffService from '@/services/api/staff.service'
import { Client, Staff, TaskReminder, TaskReminderChannel, TaskType, Task } from '@/types'
import Tasks from '@/views/erp/tasks/Tasks'
import TaskService from '@/services/api/tasks/tasks.service'
import { DataTableApiResponse } from '@/types'
import { hasPermission } from '@/utils/role-permission'
import { Metadata } from 'next'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pothole Doctors'

export const metadata: Metadata = {
  title: `Manage Tasks | ${APP_NAME}`,
  description: `Manage your ${APP_NAME} tasks.`
}

export const dynamic = 'force-dynamic'

export default async function TasksPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

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

  let responseData: DataTableApiResponse<Task> | null = null

  try {
    const response = await TaskService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
  }

  const [canCreateTask, canViewTask, canEditTask, canDeleteTask] = await Promise.all([
    hasPermission('Create Task'),
    hasPermission('View Task'),
    hasPermission('Update Task'),
    hasPermission('Delete Task')
  ])

  return (
    <Tasks
      staffs={staffs}
      clients={clients}
      taskTypes={taskTypes}
      taskReminders={taskReminders}
      taskReminderChannels={taskReminderChannels}
      initialData={responseData}
      permissions={{ canCreateTask, canViewTask, canEditTask, canDeleteTask }}
    />
  )
}
