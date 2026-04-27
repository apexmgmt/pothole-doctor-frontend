'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Commission, WorkOrder } from '@/types'
import { EditIcon, InfoIcon, UserIcon } from 'lucide-react'

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

function calculateRuleCommission(commissions: Commission[], profitAmount: number, totalAmount: number): number {
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

interface AssignUserCardProps {
  workOrder?: WorkOrder
  profit?: number
  total?: number
  customCommission?: number
  isCustomCommissionPercentage?: boolean
  onCommissionChange?: (customCommission: number, isPercentage: boolean) => void
}

const AssignUserCard = ({
  workOrder,
  profit = 0,
  total = 0,
  customCommission = 0,
  isCustomCommissionPercentage = false,
  onCommissionChange
}: AssignUserCardProps) => {
  const commissions = (workOrder?.assign_user?.userable?.commission_type?.commissions as Commission[]) ?? []
  const commissionTypeName = workOrder?.assign_user?.userable?.commission_type?.name

  const [popoverOpen, setPopoverOpen] = useState(false)
  const [draftValue, setDraftValue] = useState<string>('')
  const [draftIsPercentage, setDraftIsPercentage] = useState<boolean>(false)

  const handlePopoverOpenChange = (open: boolean) => {
    if (open) {
      setDraftValue(customCommission ? String(customCommission) : '')
      setDraftIsPercentage(isCustomCommissionPercentage)
    }

    setPopoverOpen(open)
  }

  const isCustomActive = customCommission !== 0

  // When custom commission is active, show the stored backend value (already reflects the override).
  // When cleared (customCommission === 0), recalculate live from the user's commission rules.
  const storedProfit = Number(workOrder?.profit ?? 0)

  const effectiveCommission = isCustomActive
    ? Number(workOrder?.commissions ?? 0)
    : calculateRuleCommission(commissions, profit, total)

  const effectivePercent = storedProfit > 0 ? (effectiveCommission / storedProfit) * 100 : 0

  const handleApply = () => {
    const value = parseFloat(draftValue) || 0

    onCommissionChange?.(value, draftIsPercentage)
    setPopoverOpen(false)
  }

  const handleClear = () => {
    setDraftValue('')
    onCommissionChange?.(0, false)
    setPopoverOpen(false)
  }

  return (
    <>
      <Card className='bg-zinc-900 border-zinc-800'>
        <CardContent className='p-4'>
          <h6 className='text-sm font-semibold text-zinc-200 flex items-center gap-1'>
            <UserIcon className='h-4 w-4 shrink-0' />
            <span>
              {workOrder?.assign_user?.first_name} {workOrder?.assign_user?.last_name}
            </span>

            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className='h-4 w-4 text-zinc-400 cursor-pointer hover:text-zinc-200 transition-colors shrink-0' />
                </TooltipTrigger>
                <TooltipContent
                  side='bottom'
                  align='start'
                  className='max-w-xs bg-zinc-800 border border-zinc-700 text-zinc-100 p-3 space-y-2 rounded-md shadow-lg'
                >
                  {commissions.length === 0 ? (
                    <p className='text-xs text-zinc-400'>No commission rules assigned.</p>
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
            <div className='text-sm font-semibold text-blue-200'>{effectivePercent.toFixed(2)}%</div>
            <div className='text-sm font-semibold text-zinc-200'>${effectiveCommission.toFixed(2)}</div>
          </div>

          <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
            <PopoverTrigger asChild>
              <button
                type='button'
                className='mt-1 text-sm inline-flex items-center gap-1 text-zinc-300 hover:text-zinc-100 transition-colors'
              >
                <EditIcon className='h-4 w-4' />
                Custom Commission
                {isCustomActive && <span className='text-xs text-blue-400'>(active)</span>}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side='bottom'
              align='start'
              className='w-60 bg-zinc-800 border border-zinc-700 p-3 space-y-3'
            >
              <p className='text-xs font-semibold text-zinc-300'>Custom Commission</p>

              {/* Type toggle */}
              <div className='flex gap-1'>
                <button
                  type='button'
                  onClick={() => setDraftIsPercentage(false)}
                  className={`flex-1 text-xs py-1 rounded transition-colors ${
                    !draftIsPercentage ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                  }`}
                >
                  Flat ($)
                </button>
                <button
                  type='button'
                  onClick={() => setDraftIsPercentage(true)}
                  className={`flex-1 text-xs py-1 rounded transition-colors ${
                    draftIsPercentage ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                  }`}
                >
                  Percentage (%)
                </button>
              </div>

              {/* Amount input */}
              <div className='space-y-1'>
                <Label className='text-xs text-zinc-400'>
                  {draftIsPercentage ? 'Percentage (% of total)' : 'Amount ($)'}
                </Label>
                <div className='relative'>
                  <span className='absolute left-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none'>
                    {draftIsPercentage ? '%' : '$'}
                  </span>
                  <Input
                    type='number'
                    min={0}
                    step={0.01}
                    value={draftValue}
                    onChange={e => setDraftValue(e.target.value)}
                    className='pl-6 text-xs bg-zinc-700 border-zinc-600 text-zinc-100'
                    placeholder='0.00'
                  />
                </div>
              </div>

              {/* Actions */}
              <div className='flex gap-2'>
                <Button type='button' size='sm' variant='outline' className='flex-1 text-xs h-7' onClick={handleClear}>
                  Clear
                </Button>
                <Button type='button' size='sm' className='flex-1 text-xs h-7' onClick={handleApply}>
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>
    </>
  )
}

export default AssignUserCard
