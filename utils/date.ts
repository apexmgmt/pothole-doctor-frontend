/** Utility function to format a timestamp into 'YYYY-MM-DD HH:MM:SS' format */
export function formatDateTime(timestamp: Date | string | number | null): string | null {
  if (!timestamp) return null
  const date = new Date(timestamp)
  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    ' ' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds())
  )
}

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
