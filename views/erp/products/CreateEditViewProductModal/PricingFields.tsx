'use client'

import { ReactNode, useEffect, useRef } from 'react'

import { UseFormReturn } from 'react-hook-form'

import { Field, FieldLabel } from '@/components/ui/field'
import { Unit } from '@/types'
import { getMargin, getSellPrice } from '@/utils/business-calculation'
import { FormFieldType } from '.'

interface PricingFieldsProps {
  form: UseFormReturn<any>
  uomUnits: Unit[]
  fieldStyle: string
  labelStyle: string
  renderFormField: (field: FormFieldType) => ReactNode
}

export function PricingFields({ form, uomUnits, fieldStyle, labelStyle, renderFormField }: PricingFieldsProps) {
  const purchaseUomId = form.watch('purchase_uom_id')
  const coveragePerUnitId = form.watch('coverage_per_unit_id')

  const purchaseUnit = uomUnits.find(u => u.id === purchaseUomId) ?? null
  const coverageUnit = uomUnits.find(u => u.id === coveragePerUnitId) ?? null

  const prevPurchaseUomId = useRef<string>(purchaseUomId)

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
    <>
      {/* Product Cost Field */}
      {renderFormField({
        name: 'product_cost',
        type: 'number',
        label: 'Product Cost',
        placeholder: 'Enter product cost',
        rules: { required: 'Product cost is required' },
        onChange: (value: any) => {
          const newCost = Number(value)
          const currentMargin = Number(form.getValues('margin'))

          form.setValue('selling_price', getSellPrice(newCost, currentMargin), {
            shouldDirty: true
          })
        }
      })}

      {/* Margin Field */}
      {renderFormField({
        name: 'margin',
        type: 'number',
        label: 'Margin (%)',
        placeholder: 'Enter margin',
        rules: {
          min: { value: 0, message: "Margin can't be negative" },
          max: { value: 100, message: "Margin can't be greater than 100" }
        },
        onChange: (value: any) => {
          const newMargin = Number(value)
          const currentCost = Number(form.getValues('product_cost'))

          form.setValue('selling_price', getSellPrice(currentCost, newMargin), {
            shouldDirty: true
          })
        }
      })}

      {/* Selling Price */}
      <div className={`gap-2 ${fieldStyle}`}>
        <FieldLabel className={`text-xs font-normal leading-tight justify-end gap-0 w-full ${labelStyle}`}>
          Selling Price <span className='text-sm leading-none text-red-500'>*</span>
        </FieldLabel>
        <div className='grid grid-cols-2 gap-4'>
          {renderFormField({
            name: 'selling_price',
            type: 'number',
            placeholder: 'Enter price',
            rules: { required: 'Selling price is required' },
            onChange: (value: any) => {
              const newSellingPrice = Number(value)
              const currentCost = Number(form.getValues('product_cost'))
              const newMargin = getMargin(currentCost, newSellingPrice)

              form.setValue('margin', newMargin.toFixed(4), { shouldDirty: true })
            }
          })}
          {renderFormField({
            name: 'selling_unit_id',
            type: 'select',
            placeholder: 'Price Per',
            selectOptions: sellingOptions.map(option => ({
              label: option.label,
              value: option.id,
              disabled: option.disabled
            }))
          })}
        </div>
      </div>

      {/* Minimum Quantity Field */}
      {renderFormField({
        name: 'minimum_qty',
        type: 'number',
        label: 'Minimum Quantity',
        placeholder: 'Enter minimum quantity',
        rules: {
          validate: value => {
            if (value === '' || value === null || value === undefined) {
              return true
            }

            return Number(value) >= 0 || 'Must be greater than or equal to 0'
          }
        }
      })}

      {/* Round up Quantity Field */}
      {renderFormField({
        name: 'round_up_quantity',
        type: 'checkbox',
        label: 'Round up Quantity'
      })}
    </>
  )
}
