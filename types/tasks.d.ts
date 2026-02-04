import { Client } from './clients/clients'
import { Staff } from './staff'
import { TaskType } from './task_types'
import { User } from './user'

export interface Task {
  id: string
  client_id: string
  created_by?: User
  task_type_id: string
  name: string
  start_date: string
  start_time: string
  end_date: string
  end_time: string
  location: string
  comment: string
  sms_reminder: number | 0 | 1
  email_reminder: number | 0 | 1
  status: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
  client?: Client
  task_type?: TaskType
  employees?: Staff[]
  completed_date?: string
  close_comment?: string
}

export interface TaskPayload {
  client_id: string
  task_type_id: string
  name: string
  employee_ids: string[]
  sms_reminder: number | 0 | 1
  email_reminder: number | 0 | 1
  start_date: string
  start_time: string
  end_date: string
  end_time: string
  location: string
  comment: string
  completed_date: string
  close_comment: string
  status: string
  reminders: ReminderPayload[]
}

export interface ReminderPayload {
  reminder_channel_id: string
  role_type: 'employee' | 'customer'
  task_type_id: string
  reminder_time_ids: ReminderTimeId[]
}

export interface ReminderTimeId {
  id: string
  is_enabled: number | 0 | 1
}
