export interface Document {
  id: string
  documentable_id: string
  documentable_type: string
  name: string
  full_path: string
  created_at: string
  updated_at: string
}

export interface DocumentPayload {
  user_id: string
  file: File
}
