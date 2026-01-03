import { ServiceType } from './service_types'
import { Unit } from './units'

export interface LaborCostsProps {
  serviceTypes: ServiceType[]
  units: Unit[]
  isFromModal?: boolean
}
export interface LaborCost {
  id: string
  name: string
  description: string
  cost: number
  price: number
  margin: number
  service_type_id: string
  service_type?: ServiceType
  unit_id: string
  unit?: Unit
  created_at: string
  updated_at: string
}

export interface LaborCostPayload {
  name: string
  description: string
  cost: number
  price: number
  margin: number
  service_type_id: string
  unit_id: string
}
