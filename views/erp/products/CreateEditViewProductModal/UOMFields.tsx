'use client'

import { ReactNode, useEffect } from 'react'

import { UseFormReturn } from 'react-hook-form'

import { Unit } from '@/types'
import { FormFieldType } from '.'
import { Field, FieldLabel } from '@/components/ui/field'

interface UOMFieldsProps {
  form: UseFormReturn<any>
  uomUnits: Unit[]
  fieldStyle: string
  labelStyle: string
  renderFormField: (field: FormFieldType) => ReactNode
}

export function UOMFields({ form, uomUnits, fieldStyle, labelStyle, renderFormField }: UOMFieldsProps) {
  // Watch is_rolled_good and set purchase_uom to "Roll" if needed
  const isRolledGood = form.watch('is_rolled_good')

  useEffect(() => {
    if (isRolledGood === 1) {
      const rollUnit = uomUnits.find(u => u.name.toLowerCase() === 'roll')

      if (rollUnit) {
        form.setValue('purchase_uom_id', rollUnit.id)
      }
    }
  }, [isRolledGood, uomUnits, form])

  return (
    <>
      {/* Purchase UOM */}
      {renderFormField({
        name: 'purchase_uom_id',
        type: 'combobox',
        label: 'Purchase UOM',
        placeholder: 'Select UOM',
        rules: { required: 'Purchase UOM is required' },
        selectOptions: uomUnits.map(unit => ({ label: unit.name, value: unit.id.toString() }))
      })}

      {/* UOM Info */}
      <div className={`gap-2 ${fieldStyle}`}>
        <FieldLabel className={`text-xs font-normal leading-tight w-full ${labelStyle}`}>UOM Info</FieldLabel>
        <div className='grid grid-cols-3 gap-4'>
          {(
            [
              {
                name: 'unit_per_pallet',
                placeholder: 'Unit/Pallet'
              },
              {
                name: 'piece_per_uom',
                placeholder: 'Piece/Unit'
              },
              {
                name: 'weight_per_uom',
                placeholder: 'Weight/Unit'
              }
            ] as FormFieldType[]
          ).map(field =>
            renderFormField({
              ...field,
              type: 'number'
            })
          )}
        </div>
      </div>

      {/* Coverage per UOM */}
      <div className={`gap-2 ${fieldStyle}`}>
        <FieldLabel className={`text-xs font-normal leading-tight w-full ${labelStyle}`}>Coverage per UOM</FieldLabel>
        <div className='grid grid-cols-2 gap-4'>
          {(
            [
              {
                name: 'coverage_per_rate',
                type: 'number',
                placeholder: 'Coverage Rate',
                rules: {
                  validate: value => {
                    if (value === '' || value === null || value === undefined) {
                      return true
                    }

                    return Number(value) > 0 || 'Coverage rate must be greater than 0'
                  }
                }
              },
              {
                name: 'coverage_per_unit_id',
                placeholder: 'Select Unit',
                type: 'combobox',
                selectOptions: uomUnits.map(unit => ({ label: unit.name, value: unit.id.toString() }))
              }
            ] as FormFieldType[]
          ).map(renderFormField)}
        </div>
      </div>
    </>
  )
}
