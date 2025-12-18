import { City, State } from "../location.types"
import { LeadClient } from "./leads.types"

export interface LeadAddress {
    id: string
    addressable_id: string
    addressable_type: string
    title: string
    street_address: string
    state_id: string
    city_id: string
    email: string
    phone: string
    is_default: number | 0 | 1
    zip_code: string | null 
    created_at: string
    updated_at: string
    addressable?: LeadClient
    city?: City
    state?: State
}


export interface LeadAddressPayload {
    client_id: string
    title: string
    street_address: string
    email: string 
    phone: string
    is_default: number | 0 | 1
    country_id?: string
    state_id: string
    city_id: string
    zip_code?: string
}
