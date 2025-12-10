'use client'

import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface HoldAmountFieldsProps {
  form: UseFormReturn<any>
}

export function HoldAmountFields({ form }: HoldAmountFieldsProps) {
  return (
    <>
      {/* Hold Amount Field */}
      <FormField
        control={form.control}
        name='hold_amount'
        rules={{
          required: 'Hold amount is required',
          min: { value: 0, message: 'Hold amount must be at least 0' }
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Hold Amount<span className='text-red-500'>*</span>
            </FormLabel>
            <FormControl>
              <Input type='number' placeholder='Enter hold amount' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Hold Amount Percent Field */}
      <FormField
        control={form.control}
        name='hold_amount_percent'
        rules={{
          required: 'Hold amount percent is required',
          min: { value: 0, message: 'Percentage must be at least 0' },
          max: { value: 100, message: 'Percentage cannot exceed 100' }
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Hold Amount Percent (%)<span className='text-red-500'>*</span>
            </FormLabel>
            <FormControl>
              <Input type='number' min={0} max={100} placeholder='Enter hold amount percent' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
