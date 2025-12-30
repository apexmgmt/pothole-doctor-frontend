import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Estimate, ProposalServiceItemPayload } from '@/types'
import { DollarSign, PercentIcon, X } from 'lucide-react'
import { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const DiscountDetailsCard = ({
  estimateDetails,
  discountType,
  discountValue,
  totalDiscount = 0, // Add this
  onApplyDiscount
}: {
  estimateDetails?: Estimate
  discountType: 'percentage' | 'fixed'
  discountValue: number
  totalDiscount?: number // Add this
  onApplyDiscount: (type: 'percentage' | 'fixed', value: number) => void
}) => {
  const [localType, setLocalType] = useState<'percentage' | 'fixed'>(discountType)
  const [localValue, setLocalValue] = useState<string>(discountValue.toString())

  const handleApply = () => {
    const value = parseFloat(localValue) || 0

    if (localType === 'percentage' && (value < 0 || value > 100)) {
      return
    }

    if (value < 0) {
      return
    }

    onApplyDiscount(localType, value)
  }

  return (
    <Card className='bg-zinc-900 border-zinc-800'>
      <CardContent className='p-4'>
        <h6 className='flex justify-end text-sm font-semibold text-zinc-200 mb-4'>Discount</h6>
        <div className='flex justify-end mb-2'>
          <p className='text-sm font-semibold text-red-400'>${totalDiscount.toFixed(2)}</p>
        </div>
        <Separator className='mb-2' />
        <div className='flex justify-end gap-1'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='icon'>
                {localType === 'fixed' ? <DollarSign className='h-4 w-4' /> : <PercentIcon className='h-4 w-4' />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-64 p-3'>
              <div className='space-y-2'>
                <div className='flex gap-2'>
                  <Button
                    variant={localType === 'percentage' ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setLocalType('percentage')}
                    className='flex-1'
                  >
                    <PercentIcon className='h-4 w-4 mr-1' />
                  </Button>
                  <Button
                    variant={localType === 'fixed' ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setLocalType('fixed')}
                    className='flex-1'
                  >
                    <DollarSign className='h-4 w-4 mr-1' />
                  </Button>
                </div>
                <Input
                  type='number'
                  value={localValue}
                  onChange={e => setLocalValue(e.target.value)}
                  placeholder={localType === 'percentage' ? '0-100' : 'Amount'}
                  min={0}
                  max={localType === 'percentage' ? 100 : undefined}
                  step={localType === 'percentage' ? 1 : 0.01}
                />
                <Button onClick={handleApply} className='w-full' size='sm'>
                  Apply
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant='outline'
            size='icon'
            onClick={() => {
              onApplyDiscount('percentage', 0)
              setLocalValue('0')
            }}
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default DiscountDetailsCard
