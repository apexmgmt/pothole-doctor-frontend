export interface ServiceType {
  id: string
  name: string
  is_editable: number | 1 | 0
  /**
   * Value from 0 to 100 (inclusive)
   */
  wasted_percent: number // 0-100
  abbreviation: string
  created_at: string
  updated_at: string
}

export interface ServiceTypePayload {
    name: string
    is_editable: number | 1 | 0
    /**
     * Value from 0 to 100 (inclusive)
     */
    wasted_percent: number // 0-100
    abbreviation: string
}
