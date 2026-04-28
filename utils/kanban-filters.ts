// utils/kanban-filters.ts
// Utility for managing Kanban board filter query params for API

export interface KanbanFilterOptions {
  starting_date?: string
  ending_date?: string
  [key: string]: any
}

/**
 * Converts Kanban filter options to query params for API
 * Only includes defined values
 */
export function kanbanFiltersToQueryParams(filters: KanbanFilterOptions): string {
  const params = new URLSearchParams()

  if (filters.starting_date) params.append('starting_date', filters.starting_date)
  if (filters.ending_date) params.append('ending_date', filters.ending_date)

  // Add any other filters as needed
  Object.entries(filters).forEach(([key, value]) => {
    if (value && key !== 'starting_date' && key !== 'ending_date') {
      params.append(key, value)
    }
  })

  return params.toString()
}
