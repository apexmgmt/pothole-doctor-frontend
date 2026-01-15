import { TaskType } from './task_types'

export interface TaskReminder {
  id: string
  reminder_channel_id: string
  task_id?: string | null
  task_type_id: string
  reminder_time_id: string
  role_type: string | 'employee' | 'customer'
  is_enabled: number | 1 | 0
  reminder_channel?: TaskReminderChannel
  task_type?: TaskType
  reminder_time?: TaskReminderTime
  created_at: string
  updated_at: string
}

export interface TaskReminderPayload {
  reminder_channel_id: string
  task_type_id: string
  reminder_time_id: string
  role_type: string
  is_enabled: number | 1 | 0
}

export interface TaskReminderChannel {
  id: string
  name: string
  type: string | 'sms' | 'email'
  times?: TaskReminderTime[]
  created_at: string
  updated_at: string
}

export interface TaskReminderTime {
  id: string
  reminder_channel_id: string
  channel?: TaskReminderChannel
  label: string
  type: string
  time: number
  created_at: string
  updated_at: string
}
