import React from 'react'
import { BarChart2 } from 'lucide-react'

import { formatMoney } from '../utils'

/** Maps invoice status strings to their Tailwind badge colours. */
const INVOICE_STATUS_STYLES: Record<string, string> = {
  'sent to customer': 'bg-orange-500 text-white',
  'invoice confirmed': 'bg-blue-600 text-white',
  'partially paid': 'bg-red-500 text-white',
  'fully paid': 'bg-green-600 text-white',
  draft: 'bg-gray-500 text-white',
  cancelled: 'bg-red-700 text-white',
  overdue: 'bg-red-600 text-white',
  pending: 'bg-yellow-500 text-white'
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-border/30 ${className ?? ''}`} />
}

export function LoadingSkeleton() {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-14 w-full' />
      <Skeleton className='h-10 w-full' />
      <div className='grid grid-cols-3 gap-4'>
        <Skeleton className='col-span-2 h-72' />
        <Skeleton className='h-72' />
      </div>
      <Skeleton className='h-64 w-full' />
    </div>
  )
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  const key = String(status ?? '').toLowerCase()
  const style = INVOICE_STATUS_STYLES[key] ?? 'bg-gray-500 text-white'

  return (
    <span
      className={`inline-flex items-center justify-center w-full px-2 py-1 rounded text-[11px] font-semibold ${style}`}
    >
      {status || '—'}
    </span>
  )
}

export function ProgressBar({ percentage, color = 'bg-gray-700' }: { percentage: number; color?: string }) {
  const pct = Math.min(100, Math.max(0, percentage))

  return (
    <div className='relative h-5 rounded bg-border/30 overflow-hidden'>
      <div className={`h-full rounded transition-all ${color}`} style={{ width: `${pct}%` }} />
      <span className='absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white'>
        {pct.toFixed(2)} %
      </span>
    </div>
  )
}

export function ChartTooltip({
  active,
  payload,
  label
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className='rounded-lg border border-border/40 bg-card px-3 py-2 text-xs shadow-lg'>
      <p className='font-semibold text-card-foreground mb-0.5'>{label}</p>
      <p className='text-blue-400'>{formatMoney(payload[0]?.value ?? 0)}</p>
    </div>
  )
}

export function StatPill({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className={`flex items-center gap-1.5 ${color} text-white rounded px-3 py-1.5 text-xs font-semibold`}>
      {icon}
      <span>{label}</span>
      <span className='text-sm font-bold ml-1'>{value}</span>
    </div>
  )
}

export function SidebarStat({
  label,
  count,
  amount,
  percentage,
  barColor,
  icon
}: {
  label: string
  count: number
  amount?: string
  percentage: number
  barColor: string
  icon?: React.ReactNode
}) {
  return (
    <div>
      <div className='flex items-center justify-between mb-1.5'>
        <div className='flex items-center gap-1'>
          {icon}
          <span className='text-card-foreground font-medium'>{label}</span>
        </div>
        <span className='font-bold text-card-foreground'>{amount ?? count}</span>
      </div>
      <ProgressBar percentage={percentage} color={barColor} />
    </div>
  )
}

export function ToolbarButton({ icon, label }: { icon: React.ReactNode; label?: string }) {
  return (
    <button className='flex items-center gap-1.5 border border-border/40 rounded px-2.5 py-1.5 text-xs text-muted-foreground hover:text-card-foreground cursor-pointer'>
      {icon}
      {label}
    </button>
  )
}

export function EmptyState({ message }: { message: string }) {
  return <div className='h-full flex items-center justify-center text-sm text-muted-foreground'>{message}</div>
}

export function TabPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className='bg-card rounded-xl border border-border/20 flex flex-col items-center justify-center py-20 gap-3'>
      <BarChart2 className='w-10 h-10 text-border/40' />
      <p className='text-sm font-semibold text-card-foreground'>{title}</p>
      <p className='text-xs text-muted-foreground max-w-sm text-center'>{description}</p>
    </div>
  )
}
