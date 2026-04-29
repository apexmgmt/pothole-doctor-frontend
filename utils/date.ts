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
