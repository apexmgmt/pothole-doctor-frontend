export interface NoteType {
  id: string
  name: string
  status: number | 1 | 0
  created_at: string
  updated_at: string
}

export interface NoteTypePayload {
    name: string
    status: number | 1 | 0
}
