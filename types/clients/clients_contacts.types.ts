import { City, Country, State } from '../location.types'

export interface ClientContact {
  id: string
  name: string
  phone: string
  email: string
  address: string
  client_id: string
  city_id: string
  city?: City
  state_id: string
  state?: State
  country_id: string
  country?: Country
  zip_code?: string
  created_at: string
  updated_at: string
}

export interface ClientContactPayload {
  client_id: string
  name: string
  email: string
  phone: string
  address: string
  zip_code?: string
  country_id: string
  state_id: string
  city_id: string
}
