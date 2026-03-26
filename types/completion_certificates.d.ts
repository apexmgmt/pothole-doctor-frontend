import { Model } from '.'

export interface CompletionCertificate extends Model {
  is_completed: boolean
  work_order_id: string
  service_group_id: string
  service_type_id: string
  service_type_name: string
  signature: string
  st_id?: string
  wo_id?: string
}
