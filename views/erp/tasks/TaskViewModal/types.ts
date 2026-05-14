import { Client, Staff, Task, TaskType } from '@/types'

export interface TaskViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId?: string
  canEditTask?: boolean
  onEditTask?: (id: string) => void
  clients?: Client[]
  staffs?: Staff[]
  taskTypes?: TaskType[]
  onTaskStatusChanged?: (taskId: string, newStatus: string, newOrder: number, updatedTask?: Task) => void
}

export type InlineEditableField =
  | 'name'
  | 'location'
  | 'start_date'
  | 'start_time'
  | 'end_date'
  | 'end_time'
  | 'completed_date'
  | 'close_comment'
  | 'employee_ids'
  | 'created_by_id'
  | 'client_id'
  | 'task_type_id'
  | 'status'
