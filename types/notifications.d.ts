export interface Notification {
  id: string
  user_id: string
  notifiable_type: string
  notifiable_id: string
  message: string
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface PaginatedNotifications {
  data: Notification[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
