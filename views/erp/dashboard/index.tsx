'use client'

import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'
import DashboardService from '@/services/api/dashboard.service'
import AuthService from '@/services/api/auth.service'
import CommonTable from '@/components/erp/common/table'
import OrganizationStatusSwitch from '@/views/erp/organizations/OrganizationStatusSwitch'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { Button } from '@/components/ui/button'
import { Column } from '@/types'
import { encryptData } from '@/utils/encryption'
import { appUrl } from '@/utils/utility'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface DailyRegistration {
  date?: string
  day?: string
  label?: string
  count?: number
  registrations?: number
  value?: number
  [key: string]: any
}

interface DashboardData {
  daily_registrations?: DailyRegistration[]
  latest_organizations?: any[]
  [key: string]: any
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getDayLabel(item: DailyRegistration): string {
  return item.date ?? item.day ?? item.label ?? ''
}

function getCount(item: DailyRegistration): number {
  return item.count ?? item.registrations ?? item.value ?? 0
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-border/30 ${className ?? ''}`} />
}

function LoadingSkeleton() {
  return (
    <div className='p-6 space-y-5'>
      <Skeleton className='h-[260px] w-full' />
      <div className='space-y-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    </div>
  )
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className='rounded-lg border border-border/40 bg-card px-3 py-2 text-xs shadow-lg'>
      <p className='font-semibold text-card-foreground mb-0.5'>{label}</p>
      <p className='text-primary'>{payload[0]?.value?.toLocaleString()} registrations</p>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────

const DashboardIndex = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    DashboardService.get()
      .then(res => setData(res?.data ?? res))
      .catch(err => {
        // Auth failures are handled by the interceptor (clears cookies + redirects to login)
        // Don't show a page-level error for them — just silently finish loading
        const msg: string = err?.message || ''
        if (!msg.toLowerCase().includes('authentication')) {
          setError(msg || 'Failed to load dashboard')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className='p-6'>
        <div className='rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-destructive text-sm'>
          {error}
        </div>
      </div>
    )
  }

  // ── Impersonate ───────────────────────────────────────────────────────────────

  const impersonateUser = async (userId: string) => {
    try {
      const response = await AuthService.impersonate(userId)
      const authData = {
        access_token: response?.data.access_token,
        refresh_token: response?.data.refresh_token,
        token_type: response?.data.token_type,
        expires_in: response?.data.expires_in,
        user: response?.data?.user,
        roles: response?.data?.roles || [],
        permissions: response?.data?.permissions || []
      }
      const encryptedData = encryptData(authData)
      const redirectUrl = `${appUrl(response.data.domain ?? '')}/erp/redirecting?data=${encodeURIComponent(encryptedData)}`

      window.location.href = redirectUrl
    } catch (error: any) {
      toast.error(error?.message || 'Failed to impersonate user')
    }
  }

  // ── Chart data ────────────────────────────────────────────────────────────────

  const chartData = (data?.daily_registrations ?? []).map(item => ({
    day: getDayLabel(item),
    count: getCount(item)
  }))

  // ── Table data — same transformation as Organizations.tsx ─────────────────────

  const rawOrgs: any[] = data?.latest_organizations ?? []
  const companiesData = rawOrgs.map((company: any, index: number) => ({
    id: company.id,
    index: index + 1,
    name: `${company.first_name || ''} ${company.last_name || ''}`.trim() || company.name || 'N/A',
    phone: company.userable?.phone || company.phone || 'N/A',
    company: company.domain?.domain || company.company || 'N/A',
    jobAddress: company.userable?.address || company.address || 'N/A',
    email: company.email || 'N/A',
    status: company.status
  }))

  // ── Columns — same as Organizations.tsx ───────────────────────────────────────

  const companyColumns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: row => <span className='text-gray'>{row.index}</span>,
      sortable: false
    },
    {
      id: 'name',
      header: 'Name',
      cell: row => <span className='font-medium'>{row.name}</span>,
      sortable: false
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: row => <span>{row.phone}</span>,
      sortable: false
    },
    {
      id: 'company',
      header: 'Company',
      cell: row => <span>{row.company}</span>,
      sortable: false
    },
    {
      id: 'jobAddress',
      header: 'Job Address',
      cell: row => <span className='max-w-xs truncate'>{row.jobAddress}</span>,
      sortable: false
    },
    {
      id: 'email',
      header: 'Email',
      cell: row => <span>{row.email}</span>,
      sortable: false
    },
    {
      id: 'status',
      header: 'Status',
      cell: row => (
        <OrganizationStatusSwitch
          checked={row.status}
          loading={false}
          companyId={row.id}
        />
      ),
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <ThreeDotButton
          buttons={[
            <Button
              key='impersonate'
              variant='ghost'
              size='icon'
              type='button'
              className='w-full'
              onClick={() => impersonateUser(row.id)}
            >
              Impersonate
            </Button>
          ]}
        />
      ),
      sortable: false
    }
    
  ]

  return (
    <div className='p-6 space-y-6'>

      {/* ── Daily Registrations area chart ── */}
      <div className='rounded-2xl border border-border/30 bg-card overflow-hidden'>
        <div className='px-6 pt-5 pb-2'>
          <h2 className='text-sm font-semibold text-card-foreground'>Daily Registrations</h2>
          {chartData.length > 0 && (
            <p className='text-xs text-muted-foreground mt-0.5'>
              Last {chartData.length} days
            </p>
          )}
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
                  content={<ChartTooltip />}
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
            <div className='h-full flex items-center justify-center text-sm text-muted-foreground'>
              No registration data available
            </div>
          )}
        </div>
      </div>

      {/* ── Latest Organizations table ── */}
      <div className='rounded-2xl border border-border/30 bg-card overflow-hidden'>
        <div className='px-6 py-4 border-b border-border/20 flex items-center justify-between'>
          <h2 className='text-sm font-semibold text-card-foreground'>Latest Companies</h2>
          <div className='flex items-center gap-3'>
            <span className='text-xs text-muted-foreground'>{companiesData.length} records</span>
            <a
              href='/erp/companies'
              className='text-xs text-primary hover:text-primary/80 font-medium transition-colors'
            >
              View All →
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

export default DashboardIndex
