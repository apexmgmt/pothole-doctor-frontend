export interface EstimateNote {
  id: string
  estimate_id: string
  comment: string
  created_at: string
  updated_at: string
}

export interface EstimateNotePayload {
  estimate_id: string
  comment: string
}
