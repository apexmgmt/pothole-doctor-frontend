import { ZodNullable } from 'zod'
import { Client, Model, Partner, ServiceType, Staff, WorkOrder } from '.'

export interface Schedule extends Model {
  title: string
  work_order_id: string
  work_order?: WorkOrder
  service_group_id: string
  service_group?: ProposalService
  service_type_id: string
  service_type?: ServiceType
  contractor_id: string
  contractor?: Partner
  salesman_id: string
  salesman?: Staff
  client_id: string
  client?: Client
  starting_date: string
  starting_time: string
  ending_date: string
  ending_time: string
  status: string
  special_instructions: string | null
  internal_commands: string | null
  is_show_schedule: boolean
  is_sms_contractor: boolean
  is_email_contractor: boolean
  is_sms_customer: boolean
  is_email_customer: boolean
  is_sms_salesman: boolean
  is_email_salesman: boolean
  is_scheduled: boolean
  is_labor_completed: boolean
  is_ready_for_schedule: boolean
  is_contractor_ready_for_payment: boolean
  is_contractor_paid: boolean
  deleted_at: string | null
}

export interface SchedulePayload {
  work_order_id: string
  contractor_id: string
  salesman_id: string
  client_id: string
  title: string
  starting_date: string
  starting_time: string
  ending_date: string
  ending_time: string
  is_show_schedule: boolean
  is_sms_contractor: boolean
  is_email_contractor: boolean
  is_sms_customer: boolean
  is_email_customer: boolean
  is_sms_salesman: boolean
  is_email_salesman: boolean
  special_instructions: string | null
  internal_commands: string | null
}
