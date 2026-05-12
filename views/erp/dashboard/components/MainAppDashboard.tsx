import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import OrganizationStatusSwitch from '@/views/erp/organizations/OrganizationStatusSwitch'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { Button } from '@/components/ui/button'
import CommonTable from '@/components/erp/common/table'
import { Column } from '@/types'

import { getChartValue, getDayLabel } from '../utils'
import { EmptyState } from './shared'

interface MainAppDashboardProps {
  data: Record<string, unknown> | null
  impersonateUser: (id: string) => void
}

export default function MainAppDashboard({ data, impersonateUser }: MainAppDashboardProps) {
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
