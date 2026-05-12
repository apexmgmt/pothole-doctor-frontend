import type { DateRange } from 'react-day-picker'

export interface LocationOption {
  id: string
  name: string
}

export interface StatObj {
  count: number
  percentage: number
  amount: number
}

export interface ChartPoint {
  label: string
  amount: number
}

/** Extracts a display label from a chart data point regardless of field name. */
export function getDayLabel(item: Record<string, unknown>): string {
  return (item.week ?? item.date ?? item.day ?? item.label ?? '') as string
}

/** Extracts the numeric value from a chart data point regardless of field name. */
export function getChartValue(item: Record<string, unknown>): number {
  return Number(item.amount ?? item.total_sales ?? item.count ?? item.registrations ?? item.value ?? 0)
}

/** Formats a number as a compact dollar amount (e.g. $1.23k, $4.56M). */
export function formatMoney(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}k`

  return `$${value.toFixed(2)}`
}

/** Compact Y-axis tick formatter for currency values. */
export function formatYAxis(value: number): string {
  if (value >= 1_000) {
    const k = value / 1_000

    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`
  }

  return `$${value}`
}

/** Formats an ISO date string to MM/DD/YYYY; returns '—' on failure. */
export function formatDate(raw: string | undefined): string {
  if (!raw) return '—'

  try {
    return new Date(raw).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
  } catch {
    return raw
  }
}

/** Reads the first non-null numeric field from `obj` using the provided key list. */
export function getStat(obj: Record<string, unknown> | null, keys: string[]): number {
  for (const k of keys) if (obj?.[k] != null) return Number(obj[k])

  return 0
}

/**
 * Reads the first matching field from `obj` and normalises it into a
 * `{ count, percentage, amount }` shape for use in progress-bar stats.
 */
export function getStatObj(obj: Record<string, unknown> | null, keys: string[]): StatObj {
  for (const k of keys) {
    if (obj?.[k] != null) {
      const v = obj[k] as Record<string, unknown>

      if (typeof v === 'object' && v !== null) {
        return {
          count: Number(v.count ?? v.total ?? 0),
          percentage: Number(v.percentage ?? v.percent ?? 0),
          amount: Number(v.amount ?? v.total_sales ?? v.value ?? 0)
        }
      }

      return { count: Number(v), percentage: 0, amount: Number(v) }
    }
  }

  return { count: 0, percentage: 0, amount: 0 }
}

/** Returns midnight of a date to avoid time-of-day issues in comparisons. */
export function startOf(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/** Quick-select preset definitions. */
export const DATE_PRESETS = [
  {
    label: 'Today',
    range: () => {
      const d = startOf(new Date())

      return { from: d, to: d }
    }
  },
  {
    label: 'Last 7 Days',
    range: () => {
      const to = startOf(new Date())
      const from = new Date(to)

      from.setDate(from.getDate() - 6)

      return { from, to }
    }
  },
  {
    label: 'Current Month',
    range: () => {
      const n = new Date()

      return { from: new Date(n.getFullYear(), n.getMonth(), 1), to: new Date(n.getFullYear(), n.getMonth() + 1, 0) }
    }
  },
  {
    label: 'Previous Month',
    range: () => {
      const n = new Date()

      return { from: new Date(n.getFullYear(), n.getMonth() - 1, 1), to: new Date(n.getFullYear(), n.getMonth(), 0) }
    }
  },
  {
    label: 'First Quarter',
    range: () => {
      const y = new Date().getFullYear()

      return { from: new Date(y, 0, 1), to: new Date(y, 2, 31) }
    }
  },
  {
    label: 'Second Quarter',
    range: () => {
      const y = new Date().getFullYear()

      return { from: new Date(y, 3, 1), to: new Date(y, 5, 30) }
    }
  },
  {
    label: 'Third Quarter',
    range: () => {
      const y = new Date().getFullYear()

      return { from: new Date(y, 6, 1), to: new Date(y, 8, 30) }
    }
  },
  {
    label: 'Fourth Quarter',
    range: () => {
      const y = new Date().getFullYear()

      return { from: new Date(y, 9, 1), to: new Date(y, 11, 31) }
    }
  },
  {
    label: 'Current Year',
    range: () => {
      const y = new Date().getFullYear()

      return { from: new Date(y, 0, 1), to: new Date(y, 11, 31) }
    }
  },
  {
    label: 'Previous Year',
    range: () => {
      const y = new Date().getFullYear() - 1

      return { from: new Date(y, 0, 1), to: new Date(y, 11, 31) }
    }
  },
  { label: 'Custom Range', range: () => null }
] as const

export function fmtInput(d: Date | undefined): string {
  if (!d) return ''

  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

export function fmtTrigger(range: DateRange | undefined): string {
  if (!range?.from) return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const from = range.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (!range.to || range.to.getTime() === range.from.getTime()) return from
  const to = range.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return `${from} - ${to}`
}
