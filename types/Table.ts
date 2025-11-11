export interface Column {
  id: string
  header: string
  cell: (row: any) => React.ReactNode
  sortable?: boolean
  enableSorting?: boolean
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
