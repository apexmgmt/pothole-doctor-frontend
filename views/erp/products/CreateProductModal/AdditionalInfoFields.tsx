'use client'

import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface AdditionalInfoFieldsProps {
  form: UseFormReturn<any>
}

export function AdditionalInfoFields({ form }: AdditionalInfoFieldsProps) {
  return (
    <div className='grid grid-cols-1 gap-4'>
      {/* Notify Checkbox */}
      <FormField
        control={form.control}
        name='is_notify'
        render={({ field }) => (
          <FormItem className='flex flex-row items-center gap-2'>
            <FormControl>
              <Checkbox
                checked={!!field.value}
                onCheckedChange={checked => field.onChange(checked ? 1 : 0)}
                id='is_notify'
              />
            </FormControl>
            <FormLabel htmlFor='is_notify' className='mb-0 cursor-pointer'>
              Notify
            </FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Visible Radio Group */}
      <FormField
        control={form.control}
        name='visible'
        render={({ field }) => (
          <FormItem className='flex flex-row gap-4 items-center'>
            <FormLabel>Visible</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={val => field.onChange(val === 'yes' ? 1 : 0)}
                value={field.value === 1 ? 'yes' : 'no'}
                className='flex flex-row gap-4'
              >
                <div className='flex gap-2 items-center'>
                  <RadioGroupItem value='yes' id='visible-yes' />
                  <Label htmlFor='visible-yes' className='cursor-pointer'>
                    YES
                  </Label>
                </div>
                <div className='flex gap-2 items-center'>
                  <RadioGroupItem value='no' id='visible-no' />
                  <Label htmlFor='visible-no' className='cursor-pointer'>
                    NO
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Type Radio Group */}
      <FormField
        control={form.control}
        name='type'
        render={({ field }) => (
          <FormItem className='flex flex-row gap-4 items-center'>
            <FormLabel>Product Type</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value} className='flex flex-row gap-4'>
                <div className='flex gap-2 items-center'>
                  <RadioGroupItem value='inventory' id='type-inventory' />
                  <Label htmlFor='type-inventory' className='cursor-pointer'>
                    Inventory
                  </Label>
                </div>
                <div className='flex gap-2 items-center'>
                  <RadioGroupItem value='non-inventory' id='type-non-inventory' />
                  <Label htmlFor='type-non-inventory' className='cursor-pointer'>
                    Non-Inventory
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className='col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {/* Freight Percentage Radio Group */}
        <FormField
          control={form.control}
          name='is_freight_percentage'
          render={({ field }) => (
            <FormItem className='flex flex-row gap-4 items-center'>
              <FormLabel>Freight Percentage?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={val => field.onChange(val === 'yes' ? 1 : 0)}
                  value={field.value === 1 ? 'yes' : 'no'}
                  className='flex flex-row gap-4'
                >
                  <div className='flex gap-2 items-center'>
                    <RadioGroupItem value='yes' id='freight-yes' />
                    <Label htmlFor='freight-yes' className='cursor-pointer'>
                      YES
                    </Label>
                  </div>
                  <div className='flex gap-2 items-center'>
                    <RadioGroupItem value='no' id='freight-no' />
                    <Label htmlFor='freight-no' className='cursor-pointer'>
                      NO
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Freight Amount Field - show only if freight percentage is enabled */}
        <FormField
          control={form.control}
          name='freight_amount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Freight {form.watch('is_freight_percentage') === 1 ? 'Percentage' : 'Amount'}</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step='0.01'
                  placeholder='Enter freight amount'
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* Discontinued Product Radio Group */}
      <FormField
        control={form.control}
        name='is_discontinued_product'
        render={({ field }) => (
          <FormItem className='flex flex-row gap-4 items-center'>
            <FormLabel>Discontinued Product</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={val => field.onChange(val === 'yes' ? 1 : 0)}
                value={field.value === 1 ? 'yes' : 'no'}
                className='flex flex-row gap-4'
              >
                <div className='flex gap-2 items-center'>
                  <RadioGroupItem value='yes' id='discontinued-yes' />
                  <Label htmlFor='discontinued-yes' className='cursor-pointer'>
                    YES
                  </Label>
                </div>
                <div className='flex gap-2 items-center'>
                  <RadioGroupItem value='no' id='discontinued-no' />
                  <Label htmlFor='discontinued-no' className='cursor-pointer'>
                    NO
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Comments Field */}
      <div className='col-span-2'>
        <FormField
          control={form.control}
          name='comments'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comments</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder='Enter comments' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
