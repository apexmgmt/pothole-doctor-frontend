'use client'

import { UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { FormValues } from './types'

interface TotalsSectionProps {
  form: UseFormReturn<FormValues>
  totalProductCost: number
  shippingCost: number
  finalCost: number
}

const TotalsSection = ({ form, totalProductCost, shippingCost, finalCost }: TotalsSectionProps) => {
  return (
    <div className='flex justify-end'>
      <div className='w-72 space-y-1 text-sm border border-border rounded-lg p-4'>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>Total Product Cost:</span>
          <span className='font-medium'>${totalProductCost.toFixed(2)}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>Shipping Cost:</span>
          <span className='font-medium'>${shippingCost.toFixed(2)}</span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-muted-foreground'>Tax:</span>
          <FormField
            control={form.control}
            name='tax_amount'
            render={({ field }) => (
              <FormItem className='mb-0'>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    step='any'
                    placeholder='0.00'
                    {...field}
                    className='h-7 text-xs w-24 text-right'
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className='flex justify-between border-t border-border pt-2 font-semibold'>
          <span>Final Cost:</span>
          <span>${finalCost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default TotalsSection
