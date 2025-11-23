export interface Country {
  id: string
  name: string
  code: string
  created_at: string
  updated_at: string
}

export interface CountryPayload {
  name: string
  code: string
}

export interface State {
  id: string
  name: string
  country: Country
  country_id?: string
  created_at: string
  updated_at: string
}

export interface StatePayload {
  name: string
  country_id: string
}

export interface City {
  id: string
  name: string
  state: State
  state_id?: string
  country_id?: string
  created_at: string
  updated_at: string
}

export interface CityPayload {
  name: string
  state_id: string
  country_id: string
}

export interface CityWithoutRelations {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface StateWithCities {
  id: string
  name: string
  created_at: string
  updated_at: string
  cities: CityWithoutRelations[]
}

export interface CountryWithStates {
  id: string
  name: string
  code: string
  created_at: string
  updated_at: string
  states: StateWithCities[]
}

export interface Location {
  countries: CountryWithStates[]
}
