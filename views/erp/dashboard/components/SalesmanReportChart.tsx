import React from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { formatMoney, formatYAxis } from '../utils'
import { EmptyState } from './shared'

interface SalesmanReportPoint {
  date: string
  sales_wise: number
  profit_wise: number
  commission_wise: number
}

interface SalesmanReportSeries {
  staff_id: string
  staff_name: string
  staff_email: string
  totals: {
    sales_wise: number
    profit_wise: number
    commission_wise: number
  }
  chart: SalesmanReportPoint[]
}

interface SalesmanReportPayload {
  x_axis: string
  y_axis: string
  filters: {
    starting_date: string
    end_date: string
    location_ids: string[]
  }
  series: SalesmanReportSeries[]
}

interface SalesmanReportChartProps {
  report: SalesmanReportPayload | null
  loading: boolean
  error: string | null
}

function formatChartDate(date: string): string {
  if (!date) return ''

  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return date
  }
}

function buildChartData(seriesList: SalesmanReportSeries[]) {
  const dateMap = new Map<string, Record<string, string | number>>()

  seriesList.forEach(series => {
    series.chart.forEach(point => {
      const entry = dateMap.get(point.date) ?? { label: formatChartDate(point.date), rawDate: point.date }

      entry[series.staff_name] = Number(point.sales_wise ?? 0)
      dateMap.set(point.date, entry)
    })
  })

  return Array.from(dateMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => value)
}

function ChartTooltip({
  active,
  payload,
  label
}: {
  active?: boolean
  payload?: Array<{ color?: string; dataKey?: string; value?: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className='rounded-lg border border-border/40 bg-card px-3 py-2 text-xs shadow-lg'>
      <p className='font-semibold text-card-foreground mb-1'>{label}</p>
      <div className='space-y-1'>
        {payload.map(item => (
          <div key={String(item.dataKey)} className='flex items-center justify-between gap-4'>
            <span className='flex items-center gap-2 text-card-foreground'>
              <span className='h-2 w-2 rounded-full' style={{ backgroundColor: item.color }} />
              {item.dataKey}
            </span>
            <span className='font-medium text-card-foreground'>{formatMoney(Number(item.value ?? 0))}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SalesmanReportChart({ report, loading, error }: SalesmanReportChartProps) {
  if (loading) {
    return (
      <div className='h-full flex items-center justify-center text-sm text-muted-foreground'>
        Loading salesman report...
      </div>
    )
  }

  if (error) {
    return <EmptyState message={error} />
  }

  if (!report?.series?.length) {
    return null
  }

  const activeSeries = report.series.filter(series => series.chart.length > 0)

  if (!activeSeries.length) {
    return null
  }

  const chartData = buildChartData(activeSeries)

  if (!chartData.length) {
    return null
  }

  return (
    <div className='h-full'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray='3 3' stroke='#3b3637' />
          <XAxis dataKey='label' axisLine={false} tickLine={false} tick={{ fill: '#808080', fontSize: 11 }} dy={6} />
          <YAxis
            tickFormatter={formatYAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#808080', fontSize: 11 }}
            width={52}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
          {activeSeries.map(series => (
            <Line
              key={series.staff_id}
              type='monotone'
              dataKey={series.staff_name}
              name={series.staff_name}
              stroke='#3b82f6'
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export type { SalesmanReportPayload, SalesmanReportSeries }
