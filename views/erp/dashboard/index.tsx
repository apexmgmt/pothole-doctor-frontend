'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'
import {
  ArrowRight,
  BarChart2,
  CalendarDays,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Info,
  Link2,
  MapPin,
  Search,
  TrendingUp,
  Users
} from 'lucide-react'

import DashboardService from '@/services/api/dashboard.service'
import AuthService from '@/services/api/auth.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import CommonTable from '@/components/erp/common/table'
import OrganizationStatusSwitch from '@/views/erp/organizations/OrganizationStatusSwitch'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { Button } from '@/components/ui/button'
import { Column } from '@/types'
import { encryptData } from '@/utils/encryption'
import { appUrl, isTenant } from '@/utils/utility'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LocationOption {
  id: string
  name: string
}

interface StatObj {
  count: number
  percentage: number
  amount: number
}

interface ChartPoint {
  label: string
  amount: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

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

/** Tenant dashboard tab definitions. */
const TABS = [
  { id: 'my-sales', label: 'My Sales', icon: BarChart2 },
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'sales-breakdown', label: 'Sales Breakdown', icon: DollarSign },
  { id: 'sales-conversions', label: 'Sales Conversions', icon: TrendingUp },
  { id: 'sales-team', label: 'Sales Team Rankings', icon: Users }
] as const

// ─── Pure helpers ───────────────────────────────────────────────────────────────

/** Extracts a display label from a chart data point regardless of field name. */
function getDayLabel(item: Record<string, unknown>): string {
  return (item.week ?? item.date ?? item.day ?? item.label ?? '') as string
}

/** Extracts the numeric value from a chart data point regardless of field name. */
function getChartValue(item: Record<string, unknown>): number {
  return Number(item.amount ?? item.total_sales ?? item.count ?? item.registrations ?? item.value ?? 0)
}

/** Formats a number as a compact dollar amount (e.g. $1.23k, $4.56M). */
function formatMoney(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}k`

  return `$${value.toFixed(2)}`
}

/** Compact Y-axis tick formatter for currency values. */
function formatYAxis(value: number): string {
  if (value >= 1_000) {
    const k = value / 1_000

    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`
  }

  return `$${value}`
}

/** Formats an ISO date string to MM/DD/YYYY; returns '—' on failure. */
function formatDate(raw: string | undefined): string {
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
function getStat(obj: Record<string, unknown> | null, keys: string[]): number {
  for (const k of keys) if (obj?.[k] != null) return Number(obj[k])

  return 0
}

/**
 * Reads the first matching field from `obj` and normalises it into a
 * `{ count, percentage, amount }` shape for use in progress-bar stats.
 */
function getStatObj(obj: Record<string, unknown> | null, keys: string[]): StatObj {
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

// ─── Shared UI pieces ───────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-border/30 ${className ?? ''}`} />
}

function LoadingSkeleton() {
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

function InvoiceStatusBadge({ status }: { status: string }) {
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

function ProgressBar({ percentage, color = 'bg-gray-700' }: { percentage: number; color?: string }) {
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

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null

  return (
    <div className='rounded-lg border border-border/40 bg-card px-3 py-2 text-xs shadow-lg'>
      <p className='font-semibold text-card-foreground mb-0.5'>{label}</p>
      <p className='text-blue-400'>{formatMoney(payload[0]?.value ?? 0)}</p>
    </div>
  )
}

// ─── Location Dropdown ──────────────────────────────────────────────────────────

interface LocationDropdownProps {
  locations: LocationOption[]
  selected: string
  onChange: (id: string) => void
}

function LocationDropdown({ locations, selected, onChange }: LocationDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }

    if (open) document.addEventListener('mousedown', handleOutside)

    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const label = selected ? (locations.find(l => l.id === selected)?.name ?? 'All Locations') : 'All Locations'

  return (
    <div ref={ref} className='relative'>
      <button
        onClick={() => setOpen(o => !o)}
        className='flex items-center gap-1.5 border border-border/40 rounded px-2.5 py-1.5 text-xs text-muted-foreground hover:text-card-foreground cursor-pointer'
      >
        <MapPin className='w-3 h-3' />
        {label}
        <span className='ml-0.5'>▾</span>
      </button>

      {open && (
        <div className='absolute right-0 top-full mt-1 z-50 min-w-[180px] max-h-64 overflow-y-auto rounded border border-border/40 bg-card shadow-lg'>
          {/* "All Locations" option resets the filter */}
          <DropdownItem
            label='All Locations'
            active={!selected}
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
          />
          {locations.map(loc => (
            <DropdownItem
              key={loc.id}
              label={loc.name}
              active={selected === loc.id}
              onClick={() => {
                onChange(loc.id)
                setOpen(false)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DropdownItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-border/20 ${
        active ? 'text-primary font-semibold' : 'text-card-foreground'
      }`}
    >
      <span
        className={`flex-shrink-0 w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
          active ? 'border-primary bg-primary' : 'border-border/60 bg-transparent'
        }`}
      >
        {active && (
          <svg viewBox='0 0 10 8' fill='none' className='w-2.5 h-2.5'>
            <path d='M1 4l3 3 5-6' stroke='white' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        )}
      </span>
      {label}
    </button>
  )
}

// ─── Date Range Picker ──────────────────────────────────────────────────────────

/** Returns midnight of a date to avoid time-of-day issues in comparisons. */
function startOf(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/** Quick-select preset definitions. */
const DATE_PRESETS = [
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

function fmtInput(d: Date | undefined): string {
  if (!d) return ''

  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function fmtTrigger(range: DateRange | undefined): string {
  if (!range?.from) return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const from = range.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (!range.to || range.to.getTime() === range.from.getTime()) return from
  const to = range.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return `${from} - ${to}`
}

interface DateRangePickerProps {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
}

function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>(value)
  const [activePreset, setActivePreset] = useState<string>('')
  const ref = useRef<HTMLDivElement>(null)

  // Sync draft when external value changes
  useEffect(() => {
    setDraft(value)
  }, [value])

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }

    if (open) document.addEventListener('mousedown', onOutside)

    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  function applyPreset(preset: (typeof DATE_PRESETS)[number]) {
    const result = preset.range()

    if (result) {
      setDraft(result)
      setActivePreset(preset.label)
    } else {
      // Custom Range — just let the user pick on the calendar
      setDraft(undefined)
      setActivePreset(preset.label)
    }
  }

  function handleApply() {
    onChange(draft)
    setOpen(false)
  }

  function handleCancel() {
    setDraft(value)
    setActivePreset('')
    setOpen(false)
  }

  return (
    <div ref={ref} className='relative'>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className='flex items-center gap-1.5 border border-border/40 rounded px-2.5 py-1.5 text-xs text-muted-foreground hover:text-card-foreground whitespace-nowrap cursor-pointer! transition-all'
      >
        <CalendarDays className='w-3 h-3 shrink-0' />
        {fmtTrigger(value)}
        <span className='ml-0.5'>▾</span>
      </button>

      {open && (
        <div className='absolute right-0 top-full mt-1 z-50 flex rounded border border-border/40 bg-card shadow-xl overflow-hidden'>
          {/* ── Left: calendars + inputs ── */}
          <div className='p-3 border-r border-border/20'>
            {/* Date inputs */}
            <div className='flex items-center gap-2 mb-3'>
              <div className='flex items-center gap-1.5 border border-border/40 rounded px-2 py-1'>
                <CalendarDays className='w-3 h-3 text-blue-400 shrink-0' />
                <input
                  type='text'
                  readOnly
                  value={fmtInput(draft?.from)}
                  placeholder='MM/DD/YYYY'
                  className='w-24 bg-transparent text-xs text-card-foreground outline-none placeholder-muted-foreground'
                />
              </div>
              <span className='text-muted-foreground text-xs'>—</span>
              <div className='flex items-center gap-1.5 border border-border/40 rounded px-2 py-1'>
                <CalendarDays className='w-3 h-3 text-blue-400 shrink-0' />
                <input
                  type='text'
                  readOnly
                  value={fmtInput(draft?.to)}
                  placeholder='MM/DD/YYYY'
                  className='w-24 bg-transparent text-xs text-card-foreground outline-none placeholder-muted-foreground'
                />
              </div>
            </div>

            {/* Two-month calendar */}
            <DayPicker
              mode='range'
              selected={draft}
              onSelect={setDraft}
              numberOfMonths={2}
              showOutsideDays
              classNames={{
                months: 'flex gap-4',
                month: 'flex flex-col gap-2',
                month_caption: 'flex items-center justify-center text-xs font-semibold text-card-foreground py-1',
                nav: 'flex items-center justify-between absolute top-0 w-full px-1',
                button_previous: 'p-1 rounded hover:bg-border/20 text-muted-foreground',
                button_next: 'p-1 rounded hover:bg-border/20 text-muted-foreground',
                weekdays: 'flex',
                weekday: 'w-8 h-6 flex items-center justify-center text-[10px] text-muted-foreground font-medium',
                weeks: 'flex flex-col gap-1',
                week: 'flex',
                day: 'w-8 h-8 flex items-center justify-center',
                day_button:
                  'w-7 h-7 rounded text-[11px] hover:bg-border/30 text-card-foreground transition-colors cursor-pointer',
                selected: '[&>button]:bg-blue-600 [&>button]:text-white [&>button]:hover:bg-blue-700',
                range_start: '[&>button]:bg-blue-600 [&>button]:text-white [&>button]:rounded-l-full',
                range_middle: '[&>button]:bg-blue-500/20 [&>button]:text-card-foreground [&>button]:rounded-none',
                range_end: '[&>button]:bg-blue-600 [&>button]:text-white [&>button]:rounded-r-full',
                today: '[&>button]:font-bold [&>button]:border [&>button]:border-primary',
                outside: '[&>button]:text-muted-foreground [&>button]:opacity-40',
                disabled: '[&>button]:opacity-20 [&>button]:cursor-not-allowed',
                caption_label: 'text-xs font-semibold text-card-foreground',
                root: 'relative'
              }}
            />

            {/* Apply / Cancel */}
            <div className='flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border/20'>
              <button
                onClick={handleApply}
                className='bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded transition-colors'
              >
                Apply
              </button>
              <button
                onClick={handleCancel}
                className='border border-border/40 text-muted-foreground hover:text-card-foreground text-xs px-4 py-1.5 rounded transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>

          {/* ── Right: preset list ── */}
          <div className='w-40 flex flex-col py-1 overflow-y-auto'>
            {DATE_PRESETS.map(preset => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className={`text-left px-4 py-2 text-xs transition-colors ${
                  activePreset === preset.label
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-blue-400 hover:bg-border/20'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tenant Dashboard ───────────────────────────────────────────────────────────

function TenantDashboardView({ data }: { data: Record<string, unknown> | null }) {
  const [activeTab, setActiveTab] = useState<string>('my-sales')
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Fetch business locations for the filter dropdown once on mount
  useEffect(() => {
    BusinessLocationService.getAll()
      .then(res => {
        const list: Record<string, unknown>[] = (res?.data ?? res) as Record<string, unknown>[]

        setLocations(Array.isArray(list) ? list.map(l => ({ id: String(l.id), name: String(l.name) })) : [])
      })
      .catch(() => {})
  }, [])

  // ── derived values ───────────────────────────────────────────────────────────
  const totalJobs = getStat(data, ['total_jobs', 'jobs_count'])
  const totalSales = getStat(data, ['total_sales', 'sales_total', 'revenue'])
  const profitMargin = getStat(data, ['profit_margin', 'margin'])

  const chartData: ChartPoint[] = (
    (data?.weekly_sales ?? data?.chart_data ?? data?.daily_registrations ?? []) as Record<string, unknown>[]
  ).map(item => ({ label: getDayLabel(item), amount: getChartValue(item) }))

  const myQuotes = getStatObj(data, ['my_quotes', 'quotes'])
  const myJobs = getStatObj(data, ['my_jobs'])
  const myTotalSales = getStatObj(data, ['my_total_sales', 'my_sales'])
  const myCommission = getStat(data, ['my_total_commission', 'total_commission', 'commission'])

  // Filter invoices by search term across all fields
  const allInvoices: Record<string, unknown>[] = (data?.current_invoices ??
    data?.open_invoices ??
    data?.recent_invoices ??
    data?.latest_invoices ??
    []) as Record<string, unknown>[]

  const invoices = invoiceSearch.trim()
    ? allInvoices.filter(inv => {
        const q = invoiceSearch.toLowerCase()

        return Object.values(inv).some(v =>
          String(v ?? '')
            .toLowerCase()
            .includes(q)
        )
      })
    : allInvoices

  // ── invoice table columns ───────────────────────────────────────────────────
  const invoiceColumns: Column[] = [
    {
      id: 'status',
      header: 'Status',
      sortable: false,
      cell: row => <InvoiceStatusBadge status={String(row.status ?? row.invoice_status ?? '')} />
    },
    {
      id: 'invoice_number',
      header: 'Invoice #',
      sortable: true,
      cell: row => (
        <span className='text-blue-400 font-medium'>{String(row.invoice_number ?? row.number ?? row.id ?? '—')}</span>
      )
    },
    {
      id: 'job_name',
      header: 'Job Name',
      sortable: true,
      cell: row => <span>{String(row.job_name ?? row.jobName ?? '—')}</span>
    },
    {
      id: 'company',
      header: 'Company',
      sortable: true,
      cell: row => <span className='text-blue-400'>{String(row.company ?? row.company_name ?? '—')}</span>
    },
    {
      id: 'customer',
      header: 'Customer',
      sortable: true,
      cell: row => (
        <span className='text-blue-400'>{String(row.customer_name ?? row.customer ?? row.client_name ?? '—')}</span>
      )
    },
    {
      id: 'date',
      header: 'Date',
      sortable: true,
      cell: row => <span>{formatDate(String(row.date ?? row.created_at ?? row.invoice_date ?? ''))}</span>
    },
    {
      id: 'sales_rep',
      header: 'Sales Rep',
      sortable: true,
      cell: row => <span>{String(row.sales_rep ?? row.salesRep ?? row.user_name ?? '—')}</span>
    },
    {
      id: 'total_sales',
      header: 'Total Sales',
      sortable: true,
      cell: row => (
        <span className='font-medium'>
          {row.total_sales != null
            ? `$${Number(row.total_sales).toFixed(2)}`
            : row.amount != null
              ? `$${Number(row.amount).toFixed(2)}`
              : '—'}
        </span>
      )
    },
    {
      id: 'customer_balance',
      header: 'Customer Balance',
      sortable: true,
      cell: row => (
        <span>
          {row.customer_balance != null
            ? `$${Number(row.customer_balance).toFixed(2)}`
            : row.balance != null
              ? `$${Number(row.balance).toFixed(2)}`
              : '—'}
        </span>
      )
    }
  ]

  return (
    <div className=''>
      <div className='rounded-xl bg-card'>
        {/* ── Header: title + stat pills ── */}
        <div className='border-b border-border/20 px-4 py-3 flex items-center justify-between flex-wrap gap-2.5'>
          <div className='flex items-center gap-2'>
            <BarChart2 className='w-6 h-6 text-card-foreground' />
            <h1 className='text-xl font-bold text-card-foreground'>Dashboard</h1>
          </div>
          <div className='flex items-center gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_rgba(0,0,0,0.0)]'>
            <StatPill
              icon={<FileText className='w-3.5 h-3.5' />}
              label='Total Jobs'
              value={totalJobs.toLocaleString()}
              color='bg-[#1e3a8a]'
            />
            <StatPill
              icon={<DollarSign className='w-3.5 h-3.5' />}
              label='Total Sales'
              value={formatMoney(totalSales)}
              color='bg-[#2563eb]'
            />
            <StatPill
              icon={<TrendingUp className='w-3.5 h-3.5' />}
              label='Profit Margin'
              value={Number(profitMargin).toFixed(2)}
              color='bg-[#16a34a]'
            />
          </div>
        </div>

        {/* ── Tab nav + filters ── */}
        <div className='px-4 flex items-center justify-between flex-wrap gap-3'>
          <nav className='flex overflow-x-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_rgba(0,0,0,0.0)]'>
            {TABS.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`cursor-pointer flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                    active
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-card-foreground'
                  }`}
                >
                  <Icon className='w-3.5 h-3.5' />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          <div className='flex items-center gap-2 py-2'>
            <LocationDropdown locations={locations} selected={selectedLocation} onChange={setSelectedLocation} />
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>
      </div>

      {/* ── Tab panels ── */}
      <div className='py-4 space-y-4'>
        {/* ── My Sales ── */}
        {activeTab === 'my-sales' && (
          <>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
              {/* Sales line chart */}
              <div className='lg:col-span-2 bg-card rounded-xl border border-border/20 p-4'>
                <div className='flex items-center gap-2 mb-2 text-xs text-muted-foreground'>
                  <span className='inline-block w-8 h-1 rounded bg-blue-500' />
                  <span>Total Sales</span>
                </div>
                <div className='h-[280px]'>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width='100%' height='100%'>
                      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#3b3637' />
                        <XAxis
                          dataKey='label'
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#808080', fontSize: 11 }}
                          dy={6}
                        />
                        <YAxis
                          tickFormatter={formatYAxis}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#808080', fontSize: 11 }}
                          width={52}
                        />
                        <Tooltip
                          content={<ChartTooltip />}
                          cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Line
                          type='linear'
                          dataKey='amount'
                          name='Total Sales'
                          stroke='#3b82f6'
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#3b82f6', stroke: '#3b82f6' }}
                          activeDot={{ r: 5, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState message='No sales data available' />
                  )}
                </div>
              </div>

              {/* Stats sidebar */}
              <div className='bg-card rounded-xl border border-border/20 p-4 space-y-4 text-sm'>
                <SidebarStat
                  label='My Quotes'
                  count={myQuotes.count}
                  percentage={myQuotes.percentage}
                  barColor='bg-gray-700'
                />
                <SidebarStat
                  label='My Jobs'
                  count={myJobs.count}
                  percentage={myJobs.percentage}
                  barColor='bg-teal-600'
                />
                <SidebarStat
                  label='My Total Sales'
                  count={myTotalSales.count}
                  amount={formatMoney(myTotalSales.amount)}
                  percentage={myTotalSales.percentage}
                  barColor='bg-blue-600'
                  icon={<Info className='w-3 h-3 text-blue-400' />}
                />
                <div className='flex items-center justify-between py-2 border-t border-border/20'>
                  <span className='text-card-foreground font-medium'>My Total Commission</span>
                  <span className='font-bold text-card-foreground'>{formatMoney(myCommission)}</span>
                </div>
                <div className='pt-2 border-t border-border/20'>
                  <p className='text-card-foreground font-medium mb-3'>My Bonus (Current Month)</p>
                  <p className='text-muted-foreground text-xs text-center py-4'>
                    {String(data?.my_bonus_message ?? data?.bonus_message ?? 'No commission target found')}
                  </p>
                </div>
              </div>
            </div>

            {/* Current open invoices */}
            <div className='bg-card rounded-xl border border-border/20 overflow-hidden'>
              <div className='px-4 py-3 border-b border-border/20 flex items-center justify-between flex-wrap gap-2.5'>
                <div className='flex items-center gap-2'>
                  <FileText className='w-4 h-4 text-card-foreground' />
                  <h2 className='text-sm font-semibold text-card-foreground'>Current Open Invoices</h2>
                </div>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <span>My Invoices Only</span>
                  <span className='border border-border/40 rounded px-1.5 py-0.5'>NO</span>
                </div>
              </div>
              <div className='px-4 py-2 border-b border-border/20 flex items-center gap-2 max-[575px]:flex-wrap [&>button]:max-[575px]:flex-1 [&>button]:max-[575px]:justify-center'>
                <ToolbarButton icon={<FileSpreadsheet className='w-3.5 h-3.5 text-green-500' />} label='Excel' />
                <ToolbarButton icon={<FileText className='w-3.5 h-3.5 text-red-500' />} label='PDF' />
                <ToolbarButton icon={<Link2 className='w-3.5 h-3.5' />} />
                <div className='flex items-center border border-border/40 rounded overflow-hidden max-[575px]:w-full'>
                  <input
                    type='text'
                    placeholder='Search All Columns'
                    value={invoiceSearch}
                    onChange={e => setInvoiceSearch(e.target.value)}
                    className='bg-transparent text-xs px-3 py-1.5 text-card-foreground placeholder-muted-foreground outline-none w-48 flex-1'
                  />
                  <div className='px-2 py-1.5 border-l border-border/40'>
                    <Search className='w-3.5 h-3.5 text-muted-foreground' />
                  </div>
                </div>
              </div>
              <div className='px-2'>
                <CommonTable
                  data={{
                    data: invoices,
                    per_page: invoices.length || 10,
                    total: invoices.length,
                    from: 1,
                    to: invoices.length,
                    current_page: 1,
                    last_page: 1
                  }}
                  columns={invoiceColumns}
                  showFilters={false}
                  pagination={false}
                  isLoading={false}
                  emptyMessage='No open invoices found'
                />
              </div>
            </div>
          </>
        )}

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <TabPlaceholder title='Overview' description='Company-wide performance overview will appear here.' />
        )}

        {/* ── Sales Breakdown ── */}
        {activeTab === 'sales-breakdown' && (
          <TabPlaceholder
            title='Sales Breakdown'
            description='Detailed breakdown of sales by category, product, and region will appear here.'
          />
        )}

        {/* ── Sales Conversions ── */}
        {activeTab === 'sales-conversions' && (
          <TabPlaceholder
            title='Sales Conversions'
            description='Lead-to-sale conversion rates and funnel analytics will appear here.'
          />
        )}

        {/* ── Sales Team Rankings ── */}
        {activeTab === 'sales-team' && (
          <TabPlaceholder
            title='Sales Team Rankings'
            description='Individual and team performance rankings will appear here.'
          />
        )}
      </div>
    </div>
  )
}

// ─── Tenant Dashboard sub-components ───────────────────────────────────────────

function StatPill({
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

function SidebarStat({
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

function ToolbarButton({ icon, label }: { icon: React.ReactNode; label?: string }) {
  return (
    <button className='flex items-center gap-1.5 border border-border/40 rounded px-2.5 py-1.5 text-xs text-muted-foreground hover:text-card-foreground cursor-pointer'>
      {icon}
      {label}
    </button>
  )
}

function EmptyState({ message }: { message: string }) {
  return <div className='h-full flex items-center justify-center text-sm text-muted-foreground'>{message}</div>
}

function TabPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className='bg-card rounded-xl border border-border/20 flex flex-col items-center justify-center py-20 gap-3'>
      <BarChart2 className='w-10 h-10 text-border/40' />
      <p className='text-sm font-semibold text-card-foreground'>{title}</p>
      <p className='text-xs text-muted-foreground max-w-sm text-center'>{description}</p>
    </div>
  )
}

// ─── Main App Dashboard (admin/superadmin view) ─────────────────────────────────

interface MainAppDashboardProps {
  data: Record<string, unknown> | null
  impersonateUser: (id: string) => void
}

function MainAppDashboard({ data, impersonateUser }: MainAppDashboardProps) {
  const chartData = ((data?.daily_registrations ?? []) as Record<string, unknown>[]).map(item => ({
    day: getDayLabel(item),
    count: getChartValue(item)
  }))

  const companiesData = ((data?.latest_organizations ?? []) as Record<string, unknown>[]).map((company, index) => ({
    id: String(company.id),
    index: index + 1,
    name: `${company.first_name ?? ''} ${company.last_name ?? ''}`.trim() || String(company.name ?? 'N/A'),
    phone: String((company.userable as Record<string, unknown>)?.phone ?? company.phone ?? 'N/A'),
    company: String((company.domain as Record<string, unknown>)?.domain ?? company.company ?? 'N/A'),
    jobAddress: String((company.userable as Record<string, unknown>)?.address ?? company.address ?? 'N/A'),
    email: String(company.email ?? 'N/A'),
    status: company.status
  }))

  const companyColumns: Column[] = [
    { id: 'index', header: '#', sortable: false, cell: row => <span className='text-gray'>{row.index}</span> },
    { id: 'name', header: 'Name', sortable: false, cell: row => <span className='font-medium'>{row.name}</span> },
    { id: 'phone', header: 'Phone', sortable: false, cell: row => <span>{row.phone}</span> },
    { id: 'company', header: 'Company', sortable: false, cell: row => <span>{row.company}</span> },
    {
      id: 'jobAddress',
      header: 'Job Address',
      sortable: false,
      cell: row => <span className='max-w-xs truncate'>{row.jobAddress}</span>
    },
    { id: 'email', header: 'Email', sortable: false, cell: row => <span>{row.email}</span> },
    {
      id: 'status',
      header: 'Status',
      sortable: false,
      cell: row => <OrganizationStatusSwitch checked={row.status} loading={false} companyId={row.id} />
    },
    {
      id: 'actions',
      header: 'Action',
      sortable: false,
      cell: row => (
        <ThreeDotButton
          buttons={[
            <Button
              key='impersonate'
              variant='ghost'
              size='icon'
              type='button'
              className='w-full'
              onClick={() => impersonateUser(String(row.id))}
            >
              Impersonate
            </Button>
          ]}
        />
      )
    }
  ]

  return (
    <div className='space-y-6'>
      {/* Daily registrations chart */}
      <div className='rounded-2xl border border-border/30 bg-card overflow-hidden'>
        <div className='px-6 pt-5 pb-2'>
          <h2 className='text-sm font-semibold text-card-foreground'>Daily Registrations</h2>
          {chartData.length > 0 && <p className='text-xs text-muted-foreground mt-0.5'>Last {chartData.length} days</p>}
        </div>
        <div className='h-[220px] w-full'>
          {chartData.length > 0 ? (
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                <XAxis
                  dataKey='day'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#808080', fontSize: 11 }}
                  dy={6}
                />
                <YAxis hide />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null

                    return (
                      <div className='rounded-lg border border-border/40 bg-card px-3 py-2 text-xs shadow-lg'>
                        <p className='font-semibold text-card-foreground mb-0.5'>{label}</p>
                        <p className='text-primary'>{payload[0]?.value?.toLocaleString()} registrations</p>
                      </div>
                    )
                  }}
                  cursor={{ stroke: '#7c7ce0', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Line
                  type='monotone'
                  dataKey='count'
                  stroke='#7c7ce0'
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#ffffff', stroke: '#7c7ce0', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: '#7c7ce0', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message='No registration data available' />
          )}
        </div>
      </div>

      {/* Latest organisations */}
      <div className='rounded-2xl border border-border/30 bg-card overflow-hidden'>
        <div className='px-6 py-4 border-b border-border/20 flex items-center justify-between'>
          <h2 className='text-sm font-semibold text-card-foreground'>Latest Companies</h2>
          <div className='flex items-center gap-3'>
            <span className='text-xs text-muted-foreground'>{companiesData.length} records</span>
            <a
              href='/erp/companies'
              className='text-xs text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1'
            >
              View All
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <div className='px-2'>
          <CommonTable
            data={{
              data: companiesData,
              per_page: companiesData.length || 10,
              total: companiesData.length,
              from: 1,
              to: companiesData.length,
              current_page: 1,
              last_page: 1
            }}
            columns={companyColumns}
            showFilters={false}
            pagination={false}
            isLoading={false}
            emptyMessage='No companies found'
          />
        </div>
      </div>
    </div>
  )
}

// ─── Root component ─────────────────────────────────────────────────────────────

const DashboardIndex = () => {
  const [tenantMode, setTenantMode] = useState<boolean | null>(null)
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Determine tenant context and fetch dashboard data in parallel
    isTenant().then(t => setTenantMode(t))

    DashboardService.get()
      .then(res => setData(res?.data ?? res))
      .catch(err => {
        const msg = String(err?.message ?? '')

        // Auth errors are handled globally by the interceptor (redirect to login)
        if (!msg.toLowerCase().includes('authentication')) {
          setError(msg || 'Failed to load dashboard')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const impersonateUser = useCallback(async (userId: string) => {
    try {
      const response = await AuthService.impersonate(userId)

      const authData = {
        access_token: response?.data.access_token,
        refresh_token: response?.data.refresh_token,
        token_type: response?.data.token_type,
        expires_in: response?.data.expires_in,
        user: response?.data?.user,
        roles: response?.data?.roles ?? [],
        permissions: response?.data?.permissions ?? []
      }

      const encrypted = encryptData(authData)
      const redirectUrl = `${appUrl(response.data.domain ?? '')}/erp/redirecting?data=${encodeURIComponent(encrypted)}`

      window.location.href = redirectUrl
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to impersonate user')
    }
  }, [])

  if (loading || tenantMode === null) return <LoadingSkeleton />

  if (error) {
    return (
      <div className='p-6'>
        <div className='rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-destructive text-sm'>
          {error}
        </div>
      </div>
    )
  }

  if (tenantMode) return <TenantDashboardView data={data} />

  return <MainAppDashboard data={data} impersonateUser={impersonateUser} />
}

export default DashboardIndex
