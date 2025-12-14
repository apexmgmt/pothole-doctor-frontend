export interface EmailTemplate {
  id: string
  title: string
  description: string
  subject: string
  type: string
  group: string
  created_at: string
  updated_at: string
}

export interface EmailTemplatePayload {
    title: string
    description: string
}
