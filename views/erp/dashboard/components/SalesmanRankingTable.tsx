import React from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'

import { formatMoney } from '../utils'

export interface RankingItem {
  staff_id: string
  staff_name: string
  staff_email: string
  lead_count: number
  estimate_count: number
  proposal_count: number
  invoice_count: number
  converted_invoice_count: number
  conversion_rate: number
  invoice_subtotal: number
  invoice_total_with_tax: number
  total_profit: number
  total_cost: number
  avg_margin: number
  sales_rank_percentage: number
}

interface SalesmanRankingTableProps {
  ranking: RankingItem[]
  loading: boolean
  error: string | null
}

export default function SalesmanRankingTable({ ranking, loading, error }: SalesmanRankingTableProps) {
  if (loading) {
    return (
      <div className='bg-card rounded-xl border border-border/20 p-8 flex items-center justify-center'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Loader2 className='w-4 h-4 animate-spin' />
          <span className='text-sm'>Loading rankings...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='bg-card rounded-xl border border-border/20 p-8 flex items-center justify-center'>
        <div className='flex items-center gap-2 text-red-400'>
          <AlertCircle className='w-4 h-4' />
          <span className='text-sm'>{error}</span>
        </div>
      </div>
    )
  }

  if (!ranking || ranking.length === 0) {
    return (
      <div className='bg-card rounded-xl border border-border/20 p-8 text-center'>
        <p className='text-muted-foreground text-sm'>No ranking data available for the selected period.</p>
      </div>
    )
  }

  return (
    <div className='bg-card rounded-xl border border-border/20 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full text-xs'>
          <thead className='bg-muted/30 border-b border-border/20'>
            <tr>
              <th className='px-4 py-3 text-left font-semibold text-muted-foreground'>Rank</th>
              <th className='px-4 py-3 text-left font-semibold text-muted-foreground'>Sales Rep</th>
              <th className='px-4 py-3 text-right font-semibold text-muted-foreground'>Lead Count</th>
              <th className='px-4 py-3 text-right font-semibold text-muted-foreground'>Quotes Count</th>
              <th className='px-4 py-3 text-right font-semibold text-muted-foreground'>Converted Quotes</th>
              <th className='px-4 py-3 text-right font-semibold text-muted-foreground'>Conv. Rate</th>
              <th className='px-4 py-3 text-right font-semibold text-muted-foreground'>Invoices Count</th>
              <th className='px-4 py-3 text-right font-semibold text-muted-foreground'>Total Sales Without Tax</th>
              <th className='px-4 py-3 text-right font-semibold text-muted-foreground'>Total Sales With Tax</th>
              <th className='px-4 py-3 text-right font-semibold text-muted-foreground'>Total Profit</th>
              <th className='px-4 py-3 text-right font-semibold text-muted-foreground'>Avg. Margin</th>
              <th className='px-4 py-3 text-right font-semibold text-muted-foreground'>Total Sales Rank</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/20'>
            {ranking.map((item, index) => (
              <tr key={item.staff_id} className='hover:bg-muted/20 transition-colors'>
                <td className='px-4 py-3 text-card-foreground font-medium'>{index + 1}</td>
                <td className='px-4 py-3'>
                  <div className='flex flex-col'>
                    <span className='text-blue-400 font-medium'>{item.staff_name}</span>
                    <span className='text-muted-foreground text-xs'>{item.staff_email}</span>
                  </div>
                </td>
                <td className='px-4 py-3 text-right text-card-foreground'>{item.lead_count}</td>
                <td className='px-4 py-3 text-right text-card-foreground'>{item.estimate_count}</td>
                <td className='px-4 py-3 text-right text-card-foreground'>{item.converted_invoice_count}</td>
                <td className='px-4 py-3 text-right text-card-foreground'>{Number(item.conversion_rate).toFixed(2)}%</td>
                <td className='px-4 py-3 text-right text-card-foreground'>{item.invoice_count}</td>
                <td className='px-4 py-3 text-right text-card-foreground'>
                  {formatMoney(item.invoice_subtotal)}
                </td>
                <td className='px-4 py-3 text-right text-card-foreground'>
                  {formatMoney(item.invoice_total_with_tax)}
                </td>
                <td className='px-4 py-3 text-right text-card-foreground font-medium'>
                  {formatMoney(item.total_profit)}
                </td>
                <td className='px-4 py-3 text-right text-card-foreground'>{Number(item.avg_margin).toFixed(2)}%</td>
                <td className='px-4 py-3 text-right'>
                  <div className='flex items-center justify-end gap-2'>
                    <div className='h-1.5 bg-muted rounded-full w-12'>
                      <div
                        className='h-full bg-blue-400 rounded-full transition-all'
                        style={{ width: `${item.sales_rank_percentage}%` }}
                      />
                    </div>
                    <span className='text-card-foreground font-medium min-w-12'>
                      {Number(item.sales_rank_percentage).toFixed(2)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
