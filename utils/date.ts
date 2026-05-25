import { format, parse } from 'date-fns'

/**
 * Utility function to format a timestamp into a specified date format.
 * @param timestamp - The timestamp to format.
 * @param format - The desired date format (default is 'MM/DD/YYYY hh:mm:ss A').
 * @returns The formatted date string or null if the timestamp is invalid.
 * Supported format tokens:
 * - YYYY: 4-digit year
 * - MM: 2-digit month
 * - DD: 2-digit day
 * - HH: 2-digit hour (24-hour format)
 * - hh: 2-digit hour (12-hour format)
 * - mm: 2-digit minute
 * - ss: 2-digit second
 * - A: AM/PM
 */
export function formatDateTime(
  timestamp: Date | string | number | null,
  format: string = 'MM/DD/YYYY hh:mm:ss A'
): string | null {
  if (!timestamp) return null
  const date = new Date(timestamp)
  const pad = (n: number) => n.toString().padStart(2, '0')

  const hours24 = date.getHours()
  const hours12 = hours24 % 12 || 12
  const ampm = hours24 < 12 ? 'AM' : 'PM'

  const map: Record<string, string> = {
    YYYY: date.getFullYear().toString(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(hours24),
    hh: pad(hours12),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    A: ampm
  }

  return format.replace(/YYYY|MM|DD|HH|hh|mm|ss|A/g, matched => map[matched])
}

/**
 * Utility function to format a timestamp into a specified date format.
 * @param timestamp - The timestamp to format.
 * @param format - The desired date format (default is 'MM/DD/YYYY').
 * @returns The formatted date string or null if the timestamp is invalid.
 * Supported format tokens:
 * - YYYY: 4-digit year
 * - MM: 2-digit month
 * - DD: 2-digit day
 */
export function formatDate(timestamp: Date | string | number | null, format: string = 'MM/DD/YYYY'): string | null {
  if (!timestamp) return null
  const date = new Date(timestamp)
  const pad = (n: number) => n.toString().padStart(2, '0')

  const map: Record<string, string> = {
    YYYY: date.getFullYear().toString(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate())
  }

  return format.replace(/YYYY|MM|DD/g, matched => map[matched])
}

/**
 * Converts a 24-hour time string (HH:mm) to a 12-hour time string (hh:mm a).
 * Returns null when the input is not a valid 24-hour time.
 */
export function convert24hTo12h(time24: string): string | null {
  if (!time24) return null

  const parsedTime = parse(time24, 'HH:mm', new Date())

  if (Number.isNaN(parsedTime.getTime())) return null

  return format(parsedTime, 'hh:mm a')
}

/**
 * Formats a date into a human-readable relative time.
 *
 * Supports:
 * - ISO string
 * - Date object
 * - Timestamp
 * - Simple date string (e.g. '2026-05-22')
 *
 * @param value - Date value to format.
 *
 * @returns Relative time text.
 *
 * @example
 * formatTimeAgo('2026-05-23T11:12:59.000000Z')
 * // "1hour ago"
 *
 * @example
 * formatTimeAgo('2026-05-22')
 * // "2days ago"
 *
 * @example
 * formatTimeAgo(new Date())
 * // "just now"
 *
 * @example
 * formatTimeAgo(1747992000000)
 * // "5hours ago"
 */
export function formatTimeAgo(value: string | number | Date) {
  if (!value) return ''

  const past = new Date(value)

  // Invalid date check
  if (Number.isNaN(past.getTime())) {
    return ''
  }

  const now = new Date()
  const diffMs = now.getTime() - past.getTime()

  // Future date check
  if (diffMs < 0) {
    return 'just now'
  }

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) {
    return `${years}year${years > 1 ? 's' : ''} ago`
  }

  if (months > 0) {
    return `${months}month${months > 1 ? 's' : ''} ago`
  }

  if (days > 0) {
    return `${days}day${days > 1 ? 's' : ''} ago`
  }

  if (hours > 0) {
    const remainingMinutes = minutes % 60

    if (remainingMinutes > 0) {
      return `${hours}hour${hours > 1 ? 's' : ''} ${remainingMinutes}min ago`
    }

    return `${hours}hour${hours > 1 ? 's' : ''} ago`
  }

  if (minutes > 0) {
    return `${minutes}min ago`
  }

  if (seconds > 5) {
    return `${seconds}sec ago`
  }

  return 'just now'
}
