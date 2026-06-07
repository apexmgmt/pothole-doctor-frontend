import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import CustomFormField from '@/components/form/CustomFormField'
import { Separator } from '@/components/ui/separator'
import { Estimate, ProposalServiceItemPayload } from '@/types'
import { DollarSign, PercentIcon, X } from 'lucide-react'
import { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/utils/currency'

const DiscountDetailsCard = ({
  mode,
  estimateDetails,
  discountType,
  discountValue,
  totalDiscount = 0, // Add this
  onApplyDiscount
}: {
  mode: 'create' | 'edit' | 'view'
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
    <Card className='bg-accent/40 border-accent'>
      <CardContent className='p-4 flex flex-col h-full'>
        <div className='flex1'>
          <h6 className='flex justify-end text-xs font-semibold text-zinc-200 mb-4'>Discount</h6>
          <div className='flex justify-end mb-4'>
            <p className='text-xs font-semibold text-red-400'>{formatCurrency(totalDiscount)}</p>
          </div>
        </div>
        <Separator className='mb-3' />
        {mode !== 'view' && (
          <div className='flex justify-end gap-1'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='icon' className='h-7 w-7'>
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
                      className='flex-1 h-7 w-7'
                    >
                      <PercentIcon className='h-4 w-4 mr-1' />
                    </Button>
                    <Button
                      variant={localType === 'fixed' ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setLocalType('fixed')}
                      className='flex-1 h-7 w-7'
                    >
                      <DollarSign className='h-4 w-4 mr-1' />
                    </Button>
                  </div>
                  <CustomFormField
                    type='number'
                    value={localValue}
                    onChange={(val: any) => setLocalValue(val)}
                    placeholder={localType === 'percentage' ? '0-100' : 'Amount'}
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
              className='h-7 w-7'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DiscountDetailsCard
