/**
 * Parse a YYYY-MM-DD string into a local Date object.
 * @example
 * parseLocalDate('2025-12-28') // Date object | null
 */
export const parseLocalDate = (dateStr: string): Date | null => {
  if (!dateStr || typeof dateStr !== 'string') return null

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null

  const parts = dateStr?.split('-')?.map(Number)

  if (parts.some(Number.isNaN)) return null

  const [y, m, d] = parts
  const date = new Date(y, m - 1, d)

  return date
}

/**
 * Format a Date object to YYYY-MM-DD.
 * @example
 * formatDate(new Date()) // "2025-12-28"
 */
export const formatDate = (date: Date): string => {
  if (!date || isNaN(date?.getTime())) {
    return ''
  }

  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

/**
 * Normalize Date or date string to a Date object (no time).
 * @example
 * normalizeDate('2025-12-28') // Date object
 * normalizeDate(new Date()) // Date object
 */
export const normalizeDate = (date: Date | string): Date | '' => {
  if (!date) return ''

  if (typeof date === 'string') return parseLocalDate(date) ?? ''

  if (isNaN(date?.getTime())) return ''

  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/**
 * Add days to a YYYY-MM-DD date string (timezone safe).
 * @example
 * addDays('2025-03-02', 3) // "2025-03-05"
 */
export const addDays = (dateStr: string, days: number): string => {
  const date = parseLocalDate(dateStr)

  if (!date) return ''

  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

  return formatDate(result)
}
