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
