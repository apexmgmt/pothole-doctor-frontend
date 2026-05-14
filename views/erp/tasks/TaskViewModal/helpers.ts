import { format, parse } from 'date-fns'

import { ReminderPayload, Task, TaskComment, TaskPayload } from '@/types'

export const STATUS_STYLES: Record<
  string,
  { label: string; variant: 'secondary' | 'info' | 'destructive' | 'success' | 'outline' | 'default' }
> = {
  backlog: { label: 'Backlog', variant: 'secondary' },
  'to-do': { label: 'To Do', variant: 'secondary' },
  'in-progress': { label: 'In Progress', variant: 'info' },
  overdue: { label: 'Overdue', variant: 'destructive' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'outline' }
}

export const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'to-do', label: 'To Do' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

export const getStatusMeta = (status?: string) => {
  const normalized = (status || '').toString().trim().toLowerCase().replace(/\s+/g, '-')

  return STATUS_STYLES[normalized] || { label: status || '-', variant: 'default' as const }
}

export const getDisplayName = (comment: TaskComment) => {
  const first = comment.user?.first_name || ''
  const last = comment.user?.last_name || ''
  const fullName = `${first} ${last}`.trim()

  return fullName || comment.user?.name || 'Unknown User'
}

export const getAvatarUrl = (comment: TaskComment, generateFileUrl: (raw: string) => string | null) => {
  const raw = comment.user?.userable?.profile_picture || comment.user?.profile_picture || ''

  if (!raw) return ''

  return generateFileUrl(raw) || ''
}

export const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return 'U'

  return `${parts[0][0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
}

export const formatDateTime = (value?: string) => {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString()
}

export const getPlainTextFromHtml = (value: string) => {
  if (!value) return ''

  const parser = new DOMParser()
  const doc = parser.parseFromString(value, 'text/html')

  return (doc.body.textContent || '').replace(/\u00A0/g, ' ').trim()
}

export const sortCommentsByUpdatedAt = (items: TaskComment[]) => {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updated_at || a.created_at || 0).getTime()
    const bTime = new Date(b.updated_at || b.created_at || 0).getTime()

    return aTime - bTime
  })
}

export const parseDateString = (dateString: string | null | undefined) => {
  return dateString ? parse(dateString, 'yyyy-MM-dd', new Date()) : null
}

export const buildTaskReminderPayload = (task: Task): ReminderPayload[] => {
  const groupedReminders = new Map<string, ReminderPayload>()

  ;(task.task_reminder_setting || []).forEach(setting => {
    if (setting.is_enabled !== 1) return

    const taskTypeId = setting.task_type_id || task.task_type_id || ''
    const key = `${setting.reminder_channel_id}|${setting.role_type}|${taskTypeId}`

    if (!groupedReminders.has(key)) {
      groupedReminders.set(key, {
        reminder_channel_id: setting.reminder_channel_id,
        role_type: setting.role_type,
        task_type_id: taskTypeId,
        reminder_time_ids: []
      })
    }

    groupedReminders.get(key)?.reminder_time_ids.push({
      id: setting.reminder_time_id,
      is_enabled: setting.is_enabled
    })
  })

  return Array.from(groupedReminders.values()).filter(item => item.reminder_time_ids.length > 0)
}

export const buildTaskPayload = (sourceTask: Task, overrides: Partial<TaskPayload> = {}): TaskPayload => ({
  name: sourceTask.name || '',
  client_id: sourceTask.client_id || '',
  task_type_id: sourceTask.task_type_id || '',
  employee_ids: sourceTask.employees?.map(employee => employee.id) || [],
  start_date: sourceTask.start_date || '',
  start_time: sourceTask.start_time || '',
  end_date: sourceTask.end_date || '',
  end_time: sourceTask.end_time || '',
  sms_reminder: sourceTask.sms_reminder || 0,
  email_reminder: sourceTask.email_reminder || 0,
  location: sourceTask.location || '',
  description: sourceTask.description || '',
  completed_date: sourceTask.completed_date || '',
  close_comment: sourceTask.close_comment || '',
  status: sourceTask.status || '',
  reminders: buildTaskReminderPayload(sourceTask),
  ...overrides
})

export const toTimePickerTimestamp = (timeValue?: string, dateValue?: string) => {
  if (!timeValue) return null

  const [hours = '0', minutes = '0', seconds = '0'] = timeValue.split(':')
  const baseDate = parseDateString(dateValue) || new Date()
  const next = new Date(baseDate)

  next.setHours(Number(hours), Number(minutes), Number(seconds), 0)

  return next.getTime()
}

export const fromTimePickerTimestamp = (timestamp: number | null) => {
  if (!timestamp) return ''

  return format(new Date(timestamp), 'HH:mm:ss')
}
