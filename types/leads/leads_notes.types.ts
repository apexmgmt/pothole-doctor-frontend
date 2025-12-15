import { NoteType } from '../note_types.types'
import { User } from '../user.types'
import { LeadClient } from './leads.types'

export interface LeadNote {
  id: string
  user_id: string
  client_id: string
  note_type_id: string
  subject: string
  comment: string
  created_at: string
  updated_at: string
  user?: User
  note_type?: NoteType
  client?: LeadClient
}

export interface LeadNotePayload {
  client_id: string
  note_type_id: string
  subject: string
  comment: string
}
