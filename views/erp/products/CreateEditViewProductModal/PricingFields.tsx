'use client'

import { useEffect, useRef } from 'react'

import { UseFormReturn } from 'react-hook-form'

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Unit } from '@/types'
import { getMargin, getSellPrice } from '@/utils/business-calculation'

interface PricingFieldsProps {
  form: UseFormReturn<any>
  uomUnits: Unit[]
  disabled?: boolean
}

export function PricingFields({ form, uomUnits, disabled = false }: PricingFieldsProps) {
  const purchaseUomId = form.watch('purchase_uom_id')
  const coveragePerUnitId = form.watch('coverage_per_unit_id')
  const coveragePerRate = form.watch('coverage_per_rate')
  const sellingUnitId = form.watch('selling_unit_id')

  const purchaseUnit = uomUnits.find(u => u.id === purchaseUomId) ?? null
  const coverageUnit = uomUnits.find(u => u.id === coveragePerUnitId) ?? null

  const prevPurchaseUomId = useRef<string>(purchaseUomId)
  const isMounted = useRef(false)

  /**
   * Selling by coverage unit means:
   *   selling_unit = coverage_unit  AND  coverage_unit ≠ purchase_unit
   *
   * In this case the "cost per selling unit" is:
   *   product_cost / coverage_per_rate
   *
   * Otherwise (selling_unit = purchase_unit) cost per selling unit is just product_cost.
   */
  const isSellingByCoverage =
    !!sellingUnitId && !!coveragePerUnitId && sellingUnitId === coveragePerUnitId && sellingUnitId !== purchaseUomId

  /** Returns cost per selling unit, adjusting for coverage rate when necessary. */
  const effectiveCost = (productCost: number): number => {
    const rate = Number(coveragePerRate)

    if (isSellingByCoverage && rate > 0) {
      return productCost / rate
    }

    return productCost
  }

  // Auto-default selling_unit_id to purchase_uom_id.
  // If purchase unit changes and selling was still tracking the old purchase unit, follow it.
  useEffect(() => {
    const currentSelling = form.getValues('selling_unit_id')
    const prevId = prevPurchaseUomId.current

    if (purchaseUomId && (!currentSelling || currentSelling === prevId)) {
      form.setValue('selling_unit_id', purchaseUomId)
    }

    prevPurchaseUomId.current = purchaseUomId
  }, [purchaseUomId, form])

  // Recalculate selling_price whenever coverage rate, selling unit, or coverage unit changes.
  // Skipped on the first render so we don't overwrite loaded edit-mode values.
  // useEffect(() => {
  //   if (!isMounted.current) {
  //     isMounted.current = true

  //     return
  //   }

  //   const cost = Number(form.getValues('product_cost'))
  //   const margin = Number(form.getValues('margin'))
  //   const rate = Number(coveragePerRate)

  //   const isCovSell =
  //     !!sellingUnitId && !!coveragePerUnitId && sellingUnitId === coveragePerUnitId && sellingUnitId !== purchaseUomId

  //   const ec = isCovSell && rate > 0 ? cost / rate : cost

  //   if (cost > 0) {
  //     form.setValue('selling_price', getSellPrice(ec, margin), { shouldDirty: true })
  //   }
  // }, [coveragePerRate, sellingUnitId, coveragePerUnitId])

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
              <Input
                type='number'
                step='0.01'
                placeholder='Enter product cost'
                {...field}
                disabled={disabled}
                onChange={e => {
                  field.onChange(e)
                  const newCost = Number(e.target.value)
                  const currentMargin = Number(form.getValues('margin'))

                  // form.setValue('selling_price', getSellPrice(effectiveCost(newCost), currentMargin), {
                  //   shouldDirty: true
                  // })
                  form.setValue('selling_price', getSellPrice(newCost, currentMargin), {
                    shouldDirty: true
                  })
                }}
              />
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
                onChange={e => {
                  field.onChange(e)
                  const newMargin = Number(e.target.value)
                  const currentCost = Number(form.getValues('product_cost'))

                  // form.setValue('selling_price', getSellPrice(effectiveCost(currentCost), newMargin), {
                  //   shouldDirty: true
                  // })
                  form.setValue('selling_price', getSellPrice(currentCost, newMargin), {
                    shouldDirty: true
                  })
                }}
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
                  <Input
                    type='number'
                    step='0.01'
                    placeholder='Enter price'
                    {...field}
                    disabled={disabled}
                    onChange={e => {
                      field.onChange(e)
                      const newSellingPrice = Number(e.target.value)
                      const currentCost = Number(form.getValues('product_cost'))

                      // const newMargin = getMargin(effectiveCost(currentCost), newSellingPrice)
                      const newMargin = getMargin(currentCost, newSellingPrice)

                      form.setValue('margin', newMargin.toFixed(4), { shouldDirty: true })
                    }}
                  />
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

      {/* Freight Amount */}
      {/* <FormField
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
      /> */}
      <div className='grid grid-cols-2 gap-4'>
        {/* Minimum Quantity Field */}
        <FormField
          control={form.control}
          name='minimum_qty'
          rules={{
            validate: value => {
              if (value === '' || value === null || value === undefined) {
                return true
              }

              return Number(value) >= 0 || 'Must be greater than or equal to 0'
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Minimum Quantity 
                {/* <span className='text-red-500'>*</span> */}
              </FormLabel>
              <FormControl>
                <Input
                  type='text'
                  step='1'
                  placeholder='Enter minimum quantity'
                  {...field}
                  value={field.value ?? ''}
                  disabled={disabled}
                />
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
            <FormItem className='flex flex-row items-center gap-2 mt-6'>
              <FormControl>
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={checked => field.onChange(!!checked)}
                  id='round_up_quantity'
                  disabled={disabled}
                />
              </FormControl>
              <Label htmlFor='round_up_quantity' className='cursor-pointer'>
                Round up Quantity
              </Label>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
