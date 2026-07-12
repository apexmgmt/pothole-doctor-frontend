import { Model, ProposalService, ServicePayload, ServiceType, User } from '.'

export interface ServiceTemplate extends Model {
  title: string
  service_type_id: string
  service_type: ServiceType
  created_by_id: string
  created_by: User
  service: ProposalService
}

export interface ServiceTemplatePayload {
  title: string
  service_type_id: string
  service: ServicePayload
}
