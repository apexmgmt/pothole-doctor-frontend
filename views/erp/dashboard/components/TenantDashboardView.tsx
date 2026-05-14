import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DateRange } from 'react-day-picker'
import { BarChart2, DollarSign, FileSpreadsheet, FileText, Info, Link2, Search, TrendingUp, Users } from 'lucide-react'

import ReportService from '@/services/api/reports.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import CommonTable from '@/components/erp/common/table'
import { MultiSelect } from '@/components/ui/select'
import { Invoice } from '@/types'

import { formatMoney, getStat, getStatObj, startOf, type LocationOption } from '../utils'
import DateRangePicker from './DateRangePicker'
import SalesmanReportChart, { type SalesmanReportPayload } from './SalesmanReportChart'
import SalesmanRankingTable, { type RankingItem } from './SalesmanRankingTable'
import { SidebarStat, StatPill, TabPlaceholder, ToolbarButton } from './shared'
import { getSharedInvoiceColumns } from '../../invoices/sharedInvoiceColumns'

/** Tenant dashboard tab definitions. */
const TABS = [
  { id: 'my-sales', label: 'My Sales', icon: BarChart2 },
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'sales-breakdown', label: 'Sales Breakdown', icon: DollarSign },
  { id: 'sales-conversions', label: 'Sales Conversions', icon: TrendingUp },
  { id: 'sales-team', label: 'Sales Team Rankings', icon: Users }
] as const

function toApiDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getDefaultSalesReportRange(): DateRange {
  const to = startOf(new Date())
  const from = new Date(to)

  from.setMonth(from.getMonth() - 1)

  return { from, to }
}

export default function TenantDashboardView({ data }: { data: Record<string, unknown> | null }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>('my-sales')
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getDefaultSalesReportRange())
  const [salesmanReport, setSalesmanReport] = useState<SalesmanReportPayload | null>(null)
  const [salesmanChartLoading, setSalesmanChartLoading] = useState(false)
  const [salesmanChartError, setSalesmanChartError] = useState<string | null>(null)
  const [rankingData, setRankingData] = useState<RankingItem[]>([])
  const [rankingLoading, setRankingLoading] = useState(false)
  const [rankingError, setRankingError] = useState<string | null>(null)

  // Fetch business locations for the filter dropdown once on mount
  useEffect(() => {
    BusinessLocationService.getAll()
      .then(res => {
        const list: Record<string, unknown>[] = (res?.data ?? res) as Record<string, unknown>[]

        setLocations(Array.isArray(list) ? list.map(l => ({ id: String(l.id), name: String(l.name) })) : [])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) return

    setSalesmanChartLoading(true)
    setSalesmanChartError(null)

    ReportService.getSalesmanChartReport({
      starting_date: toApiDate(dateRange.from),
      end_date: toApiDate(dateRange.to),
      location_ids: selectedLocations
    })
      .then(res => {
        setSalesmanReport((res?.data ?? null) as SalesmanReportPayload | null)
      })
      .catch(err => {
        setSalesmanReport(null)
        setSalesmanChartError(String(err?.message ?? 'Failed to load salesman report'))
      })
      .finally(() => setSalesmanChartLoading(false))
  }, [dateRange, selectedLocations])

  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) return

    setRankingLoading(true)
    setRankingError(null)

    ReportService.getSalesmanRankingReport({
      starting_date: toApiDate(dateRange.from),
      end_date: toApiDate(dateRange.to),
      location_ids: selectedLocations
    })
      .then(res => {
        const rankingArray = (res?.data?.ranking ?? null) as RankingItem[] | null

        setRankingData(rankingArray ?? [])
      })
      .catch(err => {
        setRankingData([])
        setRankingError(String(err?.message ?? 'Failed to load ranking report'))
      })
      .finally(() => setRankingLoading(false))
  }, [dateRange, selectedLocations])

  // ── derived values ───────────────────────────────────────────────────────────
  const totalJobs = getStat(data, ['total_jobs', 'jobs_count'])
  const totalSales = getStat(data, ['total_sales', 'sales_total', 'revenue'])
  const profitMargin = getStat(data, ['profit_margin', 'margin'])

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

  const normalizedInvoices = useMemo(() => {
    return invoices.map(inv => {
      const firstName = String(inv.customer_first_name ?? '').trim()
      const lastName = String(inv.customer_last_name ?? '').trim()
      const customerName = String(inv.customer_name ?? inv.customer ?? inv.client_name ?? '').trim()
      const [fallbackFirstName = '', ...restNameParts] = customerName.split(' ').filter(Boolean)
      const fallbackLastName = restNameParts.join(' ')

      return {
        ...inv,
        issue_date: inv.issue_date ?? inv.invoice_date ?? inv.date ?? inv.created_at,
        created_at: inv.created_at ?? inv.date ?? inv.invoice_date,
        client: inv.client ?? {
          first_name: firstName || fallbackFirstName,
          last_name: lastName || fallbackLastName,
          company: {
            name: String(inv.company ?? inv.company_name ?? '')
          }
        },
        assign_user: inv.assign_user ?? {
          first_name: String(inv.sales_rep_first_name ?? '').trim(),
          last_name: String(inv.sales_rep_last_name ?? '').trim() || String(inv.sales_rep ?? inv.user_name ?? '').trim()
        },
        title: inv.title ?? inv.job_name,
        total: inv.total ?? inv.total_sales ?? inv.amount,
        sale_tax: inv.sale_tax ?? inv.tax,
        discount: inv.discount ?? 0,
        location: inv.location ?? {
          name: String(inv.location_name ?? '')
        }
      } as Invoice
    })
  }, [invoices])

  const invoiceColumns = useMemo(
    () =>
      getSharedInvoiceColumns((row: Invoice) => {
        if (row?.id) {
          router.push(`/erp/invoices/${row.id}`)
        }
      }),
    [router]
  )

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
            <div className='min-w-[250px]'>
              <MultiSelect
                options={locations.map(location => ({ value: location.id, label: location.name }))}
                selected={selectedLocations}
                onChange={setSelectedLocations}
                placeholder='Select locations'
              />
            </div>
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
                  <span>Salesman Report</span>
                </div>
                <div className='h-[280px]'>
                  <SalesmanReportChart
                    report={salesmanReport}
                    loading={salesmanChartLoading}
                    error={salesmanChartError}
                  />
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
                    data: normalizedInvoices,
                    per_page: normalizedInvoices.length || 10,
                    total: normalizedInvoices.length,
                    from: 1,
                    to: normalizedInvoices.length,
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
          <SalesmanRankingTable ranking={rankingData} loading={rankingLoading} error={rankingError} />
        )}
      </div>
    </div>
  )
}
