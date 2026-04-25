import { Model } from '.'

export interface Courier extends Model {
  name: string
  website: string
  contact_number: string
  email: string
  fax: string
}

export interface CourierPayload {
  name: string
  website: string
  contact_number: string
  email: string
  fax: string
}
