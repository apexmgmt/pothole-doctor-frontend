'use client'

import { useEffect, useRef } from 'react'

import { UseFormReturn } from 'react-hook-form'

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Unit } from '@/types'

interface PricingFieldsProps {
  form: UseFormReturn<any>
  uomUnits: Unit[]
  disabled?: boolean
}

export function PricingFields({ form, uomUnits, disabled = false }: PricingFieldsProps) {
  const purchaseUomId = form.watch('purchase_uom_id')
  const coveragePerUnitId = form.watch('coverage_per_unit_id')

  const purchaseUnit = uomUnits.find(u => u.id === purchaseUomId) ?? null
  const coverageUnit = uomUnits.find(u => u.id === coveragePerUnitId) ?? null

  const prevPurchaseUomId = useRef<string>(purchaseUomId)

  // Auto-default selling_unit_id to purchase_uom_id.
  // If purchase unit changes and selling was tracking the old purchase unit, follow the change.
  useEffect(() => {
    const currentSelling = form.getValues('selling_unit_id')
    const prevId = prevPurchaseUomId.current

    if (purchaseUomId && (!currentSelling || currentSelling === prevId)) {
      form.setValue('selling_unit_id', purchaseUomId)
    }

    prevPurchaseUomId.current = purchaseUomId
  }, [purchaseUomId, form])

  // Build the two selectable options.
  // Deduplicate when purchase and coverage resolve to the same unit.
  const sellingOptions: { id: string; label: string; disabled: boolean }[] = [
    {
      id: purchaseUomId || '__purchase__',
      label: purchaseUnit ? purchaseUnit.name : 'Select Unit',
      disabled: !purchaseUomId
    }
  ]

  const coverageIsDifferent = coveragePerUnitId && coveragePerUnitId !== purchaseUomId
  const coverageIsUnset = !coveragePerUnitId

  if (coverageIsDifferent || coverageIsUnset) {
    sellingOptions.push({
      id: coveragePerUnitId || '__coverage__',
      label: coverageUnit ? coverageUnit.name : 'Select Unit',
      disabled: !coveragePerUnitId
    })
  }

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
              <Input type='number' step='0.01' placeholder='Enter product cost' {...field} disabled={disabled} />
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
              <Input
                type='number'
                step='0.01'
                min={0}
                max={100}
                placeholder='Enter margin'
                {...field}
                disabled={disabled}
              />
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
            name='selling_price'
            rules={{ required: 'Selling price is required', min: { value: 0, message: 'Must be at least 0' } }}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type='number' step='0.01' placeholder='Enter price' {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='selling_unit_id'
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value || ''} disabled={disabled}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Price Per' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sellingOptions.map(option => (
                      <SelectItem key={option.id} value={option.id} disabled={option.disabled}>
                        {option.label}
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

      {/* Purchase to Selling Conversion Rate */}
      <FormField
        control={form.control}
        name='purchase_to_selling_conversion_rate'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Purchase to Selling Conversion Rate</FormLabel>
            <FormControl>
              <Input
                type='number'
                step='0.0001'
                min={0}
                placeholder='Enter conversion rate'
                {...field}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Freight Amount */}
      <FormField
        control={form.control}
        name='freight_amount'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Freight Amount</FormLabel>
            <FormControl>
              <Input
                type='number'
                step='0.01'
                min={0}
                placeholder='Enter freight amount'
                {...field}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className='grid grid-cols-2 gap-4'>
        {/* Minimum Quantity Field */}
        <FormField
          control={form.control}
          name='minimum_qty'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Quantity</FormLabel>
              <FormControl>
                <Input type='number' step='0.01' placeholder='Enter minimum quantity' {...field} disabled={disabled} />
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
                <Input type='number' step='0.01' placeholder='Enter round up quantity' {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
