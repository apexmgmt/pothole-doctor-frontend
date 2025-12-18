import { NoteType } from '../note_types.types'
import { User } from '../user.types'

export interface ClientNote {
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
}

export interface ClientNotePayload {
  client_id: string
  note_type_id: string
  subject: string
  comment: string
}
