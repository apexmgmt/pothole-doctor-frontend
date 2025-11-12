export interface Country {
    id: number
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
    id: number
    name: string
    country: Country
    created_at: string
    updated_at: string
}

export interface StatePayload {
    name: string
    country_id: string
}

export interface City {
    id: number
    name: string
    state: State
    country: Country
    created_at: string
    updated_at: string
}

export interface CityPayload {
    name: string
    state_id: string
    country_id: string
}

export interface CityWithoutRelations {
    id: number
    name: string
    created_at: string
    updated_at: string
}

export interface StateWithCities {
    id: number
    name: string
    created_at: string
    updated_at: string
    cities: CityWithoutRelations[]
}

export interface CountryWithStates {
    id: number
    name: string
    code: string
    created_at: string
    updated_at: string
    states: StateWithCities[]
}

export interface Location {
    countries: CountryWithStates[]
}
