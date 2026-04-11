'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ShipmentTotalsCardProps {
  totalProductCost: number
  shippingCost: number
  taxAmount: string
  otherCosts: string
  actualFinalCost: number
  onTaxChange: (value: string) => void
  onOtherCostsChange: (value: string) => void
  viewOnly?: boolean
}

// ─── Component ─────────────────────────────────────────────────────────────────

const ShipmentTotalsCard = ({
  totalProductCost,
  shippingCost,
  taxAmount,
  otherCosts,
  actualFinalCost,
  onTaxChange,
  onOtherCostsChange,
  viewOnly = false
}: ShipmentTotalsCardProps) => (
  <div className='flex justify-end'>
    <Card className='w-72 p-4 space-y-2 text-sm'>
      <div className='flex justify-between'>
        <span className='text-muted-foreground'>Total Product Cost:</span>
        <span className='font-medium'>${Number(totalProductCost).toFixed(2)}</span>
      </div>
      <div className='flex justify-between'>
        <span className='text-muted-foreground'>Shipping Cost:</span>
        <span className='font-medium'>${Number(shippingCost).toFixed(2)}</span>
      </div>
      <div className='flex justify-between items-center'>
        <span className='text-muted-foreground'>Tax:</span>
        {viewOnly ? (
          <span className='font-medium'>${Number(taxAmount || 0).toFixed(2)}</span>
        ) : (
          <Input
            type='number'
            min={0}
            step='any'
            placeholder='0.00'
            value={taxAmount}
            onChange={e => onTaxChange(e.target.value)}
            className='h-7 text-xs w-24 text-right'
          />
        )}
      </div>
      <div className='flex justify-between items-center'>
        <span className='text-muted-foreground'>Other Cost:</span>
        {viewOnly ? (
          <span className='font-medium'>${Number(otherCosts || 0).toFixed(2)}</span>
        ) : (
          <Input
            type='number'
            min={0}
            step='any'
            placeholder='0.00'
            value={otherCosts}
            onChange={e => onOtherCostsChange(e.target.value)}
            className='h-7 text-xs w-24 text-right'
          />
        )}
      </div>
      <div className='flex justify-between border-t border-border pt-2 font-semibold'>
        <span>Actual Final Cost:</span>
        <span>${Number(actualFinalCost).toFixed(2)}</span>
      </div>
    </Card>
  </div>
)

export default ShipmentTotalsCard
