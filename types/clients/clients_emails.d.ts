import { User } from '../user'

export interface ClientEmail {
  id: string
  client_id: string
  user_id: string
  user?: User
  cc_email: string
  subject: string
  source: string
  message: string
  created_at: string
  updated_at: string
}

export interface ClientEmailPayload {
  client_id: string
  subject: string
  source: string
  message: string
  cc_email: string
}
