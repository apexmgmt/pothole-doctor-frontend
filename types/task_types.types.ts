export interface TaskType {
  id: string
  name: string
  is_editable: number | 1 | 0
  created_at: string
  updated_at: string
}

export interface TaskTypePayload {
    name: string
    is_editable: number | 1 | 0
}
