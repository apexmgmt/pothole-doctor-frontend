import { Staff, TaskType, User, Client, Model } from '..'

export interface Task extends Model {
  id: string
  client_id: string
  created_by?: User
  task_type_id: string
  name: string
  description: string | null
  comments: TaskComment[]
  start_date: string
  start_time: string
  end_date: string
  end_time: string
  location: string
  sms_reminder: number | 0 | 1
  email_reminder: number | 0 | 1
  status: string
  deleted_at?: string | null
  client?: Client
  task_type?: TaskType
  employees?: Staff[]
  completed_date?: string
  close_comment?: string
  task_reminder_setting?: TaskReminderSetting[]
  order: number
}

export interface TaskComment extends Model {
  task_id: string
  user_id: string
  user?: User
  comment: string
}

export interface TaskPayload {
  description: string
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
  completed_date: string
  close_comment: string
  status: string
  reminders: ReminderPayload[]
}

export interface TaskCommentPayload {
  task_id?: string
  user_id: string 
  comment: string
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

export interface TaskReminderSetting extends Model {
  task_id: string
  reminder_channel_id: string
  task_type_id: string
  reminder_time_id: string 
  role_type: 'employee' | 'customer'
  is_enabled: 0 | 1
  reminder_channel?: ReminderChannel
  reminder_time?: ReminderTime
}
export interface ReminderChannel extends Model {
  name: string
  type: string
}
export interface ReminderTime extends Model {
  reminder_channel_id: string
  label: string
  type: string
  time: number
}
