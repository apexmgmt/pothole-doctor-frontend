import { City, CountryWithStates, State, BusinessLocation} from '.'

export interface Warehouse {
  id: string
  title: string
  email: string
  phone?: string
  fax_number?: string
  tax_rate: number
  street: string
  state_id: string
  state?: State
  city_id: string
  city?: City
  zip_code: string
  locations: BusinessLocation[]
  created_at: string
  updated_at: string
}

export interface WarehousePayload {
  title: string
  email: string
  phone: string
  fax_number: string
  tax_rate: number
  street: string
  state_id: string
  city_id: string
  zip_code: string
  location_id: string[]
}

export interface WarehousesProps {
  businessLocations: BusinessLocation[]
  countriesWithStateAndCities: CountryWithStates[]
}

export interface WarehouseFormValues {
  location_id: string[]
  title: string
  email: string
  phone: string
  fax_number: string
  tax_rate: number
  street: string
  state_id: string
  city_id: string
  zip_code: string
  country_id: string
}

export interface CreateOrEditWarehouseModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  businessLocations: BusinessLocation[]
  countriesWithStateAndCities: CountryWithStates[]
  warehouseId?: string
  warehouseDetails?: Warehouse
  onSuccess?: () => void
}
