import { BusinessLocation } from '../business_location'
import { Client } from '../clients/clients'
import { EstimateType } from '../estimate_types'
import { PaymentTerm } from '../payment_terms'
import { ServiceType } from '../service_types'
import { Staff } from '../staff'

export interface Estimate {
  id: string
  estimate_number: number
  status: string
  title: string
  location: string
  client_id: string
  client?: Client
  estimate_type_id: string
  interaction?: 'cash_and_pickup' | 'cash_and_delivery' | '' | null
  pickup_date?: string | null
  pickup_location_id?: string | null
  pickup_location?: BusinessLocation | null
  pickup_notes?: string | null
  delivery_datetime?: string | null
  delivery_location?: string | null
  delivery_notes?: string | null
  estimate_type?: EstimateType
  assign_id: string
  assign_user?: Staff
  service_type_id: string
  service_type?: ServiceType
  payment_term_id: string
  payment_term?: PaymentTerm
  expiration_date: string
  biding_date: string
  take_off_data: TakeoffData | null
  tax_rate: number
  created_at: string
  updated_at: string
}

export interface EstimatePayload {
  service_type_id: string
  estimate_type_id: string
  client_id: string
  assign_id: string
  payment_term_id: string
  title: string
  location: string
  expiration_date: string
  biding_date: string

  // Material Only fields
  interaction?: 'cash_and_pickup' | 'cash_and_delivery' | '' | null
  pickup_date?: string | null
  pickup_location_id?: string | null
  pickup_notes?: string | null
  delivery_datetime?: string | null
  delivery_location?: string | null
  delivery_notes?: string | null
  tax_rate?: number
}

export interface TakeoffData {
  address: string
  center: google.maps.LatLngLiteral
  zoom?: number
  polygons: SavedPolygon[]
  totalArea: {
    squareFeet: number
    squareMeters: number
  }
}
export interface PolygonColor {
  fill: string
  stroke: string
  name: string
}
interface SavedPolygon {
  id: string

  // Support holes (Array of Arrays)
  paths: google.maps.LatLngLiteral[] | google.maps.LatLngLiteral[][]
  color: PolygonColor
  area: {
    squareFeet: number
    squareMeters: number
  }
  perimeter: {
    yards: number
    meters: number
  }
  name: string
  notes: string | null
}
