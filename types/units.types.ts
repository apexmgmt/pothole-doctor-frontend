export interface Unit {
  id: string
  name: string
  group: string | 'uom' | 'measure'
  created_at: string
  updated_at: string
}

export interface UnitPayload {
  name: string
  group: string | 'uom' | 'measure'
}
