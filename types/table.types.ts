import { ReactNode } from 'react'

export type Column = {
  id: string
  header: string
  cell: (row: any) => ReactNode
  sortable?: boolean
  enableSorting?: boolean
  headerAlign?: 'left' | 'center' | 'right'
  size?: number | string // width in pixels or percentage (e.g., 100, '20%', 'auto')
}

export interface DataTableApiResponse {
  data: any[]
  per_page: number
  total: number
  from: number
  to: number
  current_page: number
  last_page: number
}
