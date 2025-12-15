import { LeadClient } from "./leads.types"

export interface LeadSms {
  id: string
  client_id: string
  message: string
  to: string
  type: string | null
  received_from: string | null
  sent_date: string | null
  status: number | 1 | 0
  created_at: string
  updated_at: string
  client?: LeadClient
}

export interface LeadSmsPayload {
  client_id: string
  message: string
  to: string
  received_from?: string
  type?: string
  send_date?: string
  status?: number | 1 | 0
}
