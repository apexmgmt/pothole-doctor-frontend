// You can place this in a utils/date.ts file or directly in your form submit handler

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
