import { User } from '../user.types'
import { LeadClient } from './leads.types'

export interface LeadEmail {
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
  client?: LeadClient
}

export interface LeadEmailPayload {
  client_id: string
  subject: string
  source: string
  message: string
  cc_email: string
}
