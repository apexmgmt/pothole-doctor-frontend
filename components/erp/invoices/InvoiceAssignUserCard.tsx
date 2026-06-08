'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Commission, Invoice } from '@/types'
import { formatCurrency } from '@/utils/currency'
import { InfoIcon, UserIcon } from 'lucide-react'

function formatRuleLabel(c: Commission): string {
  const rate =
    Number(c.commission_percent) === 1
      ? `${Number(c.amount).toFixed(2)}% of ${c.based_on.replace(/-/g, ' ')}`
      : `$${Number(c.amount).toFixed(2)} flat`

  const filter = (() => {
    switch (c.filter_type) {
      case 'between':
        return `between ${c.min_amount} – ${c.max_amount}${Number(c.filter_percent) === 1 ? '%' : ''}`
      case 'greater-than':
        return `> ${c.min_amount}${Number(c.filter_percent) === 1 ? '%' : ''}`
      case 'less-than':
        return `< ${c.max_amount}${Number(c.filter_percent) === 1 ? '%' : ''}`
      default:
        return c.filter_type
    }
  })()

  return `${rate} (${filter}, ${c.per.replace(/-/g, ' ')})`
}

const filterPriority: Record<string, number> = {
  between: 1,
  'greater-than': 2,
  'less-than': 3,
  'same-as-store': 4
}

function getBaseValue(commission: Commission, profitAmount: number, totalAmount: number): number {
  switch (commission.based_on) {
    case 'commission-by-profit':
      return profitAmount
    case 'commission-by-sales':
    case 'bonus-by-sales':
      return totalAmount
    default:
      return 0
  }
}

function checkFilterType(commission: Commission, compareValue: number, minAmount: number, maxAmount: number): boolean {
  switch (commission.filter_type) {
    case 'greater-than':
      return compareValue > minAmount
    case 'less-than':
      return compareValue < maxAmount
    case 'between':
      return compareValue >= minAmount && compareValue <= maxAmount
    default:
      return false
  }
}

export function calculateRuleCommission(commissions: Commission[], profitAmount: number, totalAmount: number): number {
  const eligible = [...commissions]
    .filter(c => c.per === 'per-job')
    .sort((a, b) => (filterPriority[a.filter_type] ?? 99) - (filterPriority[b.filter_type] ?? 99))

  for (const commission of eligible) {
    const baseValue = getBaseValue(commission, profitAmount, totalAmount)

    const compareValue =
      Number(commission.filter_percent) === 1 && totalAmount > 0 ? (baseValue / totalAmount) * 100 : baseValue

    const minAmount = Number(commission.min_amount ?? 0)
    const maxAmount = Number(commission.max_amount ?? 0)

    if (!checkFilterType(commission, compareValue, minAmount, maxAmount)) continue

    return Number(commission.commission_percent) === 1
      ? (baseValue * Number(commission.amount)) / 100
      : Number(commission.amount)
  }

  return 0
}

interface InvoiceAssignUserCardProps {
  invoice?: Invoice
  profit?: number
  total?: number
}

const InvoiceAssignUserCard = ({ invoice, profit = 0, total = 0 }: InvoiceAssignUserCardProps) => {
  const workOrder = invoice?.work_order

  const commissions = (invoice?.assign_user?.userable?.commission_type?.commissions as Commission[]) ?? []
  const commissionTypeName = invoice?.assign_user?.userable?.commission_type?.name
  const customCommission = Number(workOrder?.custom_commissions ?? 0)
  const isCustomCommissionPercentage = Boolean(workOrder?.is_custom_commission_percent ?? false)
  const isCustomActive = !!customCommission

  // When custom commission is active, show the stored backend value.
  // When cleared (customCommission === 0), recalculate live from the user's commission rules.
  const effectiveCommission = isCustomActive
    ? Number(workOrder?.commissions ?? 0)
    : calculateRuleCommission(commissions, profit, total)

  const effectivePercent = profit > 0 ? (effectiveCommission / profit) * 100 : 0

  return (
    <>
      <Card className='bg-accent/40 border-accent'>
        <CardContent className='p-4'>
          <h6 className='text-xs font-semibold text-zinc-200 flex items-center gap-1'>
            <UserIcon className='h-4 w-4 shrink-0' />
            <span>
              {invoice?.assign_user?.first_name} {invoice?.assign_user?.last_name}
            </span>

            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className='h-4 w-4 text-accent-foreground cursor-pointer hover:text-zinc-200 transition-colors shrink-0' />
                </TooltipTrigger>
                <TooltipContent
                  side='bottom'
                  align='start'
                  className='max-w-xs bg-accent text-accent-foreground p-3 rounded-md shadow-lg'
                >
                  {commissions.length === 0 ? (
                    <p className='text-xs text-accent-foreground'>No commission rules assigned.</p>
                  ) : (
                    <>
                      {commissionTypeName && (
                        <p className='text-xs font-semibold text-zinc-300 mb-1'>{commissionTypeName}</p>
                      )}
                      <ul className='space-y-1'>
                        {commissions.map(c => (
                          <li key={c.id} className='text-xs text-zinc-200'>
                            • {formatRuleLabel(c)}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h6>

          <div className='flex justify-between mt-4'>
            <div className='text-xs font-semibold text-blue-200'>{effectivePercent.toFixed(2)}%</div>
            <div className='text-xs font-semibold text-zinc-200'>{formatCurrency(effectiveCommission)}</div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default InvoiceAssignUserCard
