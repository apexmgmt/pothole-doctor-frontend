'use client'

import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Unit } from '@/types'

interface PricingFieldsProps {
  form: UseFormReturn<any>
  uomUnits: Unit[]
}

export function PricingFields({ form, uomUnits }: PricingFieldsProps) {
  return (
    <div className='space-y-4'>
      {/* Product Cost Field */}
      <FormField
        control={form.control}
        name='product_cost'
        rules={{ required: 'Product cost is required', min: { value: 0, message: 'Must be at least 0' } }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Product Cost <span className='text-red-500'>*</span>
            </FormLabel>
            <FormControl>
              <Input type='number' step='0.01' placeholder='Enter product cost' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Margin Field */}
      <FormField
        control={form.control}
        name='margin'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Margin (%)</FormLabel>
            <FormControl>
              <Input type='number' step='0.01' min={0} max={100} placeholder='Enter margin' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Selling Price */}
      <div className='space-y-2'>
        <FormLabel>
          Selling Price <span className='text-red-500'>*</span>
        </FormLabel>
        <div className='grid grid-cols-2 gap-2'>
          <FormField
            control={form.control}
            name='selling_info.value'
            rules={{ required: 'Selling price is required', min: { value: 0, message: 'Must be at least 0' } }}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type='number' step='0.01' placeholder='Enter price' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='selling_info.unit'
            rules={{ required: 'Price unit is required' }}
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select Unit' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {uomUnits.map(unit => (
                      <SelectItem key={unit.id} value={unit.id.toString()}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        {/* Minimum Quantity Field */}
        <FormField
          control={form.control}
          name='minimum_qty'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Quantity</FormLabel>
              <FormControl>
                <Input type='number' step='0.01' placeholder='Enter minimum quantity' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Round up Quantity Field */}
        <FormField
          control={form.control}
          name='round_up_quantity'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Round up Quantity</FormLabel>
              <FormControl>
                <Input type='number' step='0.01' placeholder='Enter round up quantity' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
