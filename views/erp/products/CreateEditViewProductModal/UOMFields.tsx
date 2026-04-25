'use client'

import { useEffect } from 'react'

import { UseFormReturn } from 'react-hook-form'

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Unit } from '@/types'

interface UOMFieldsProps {
  form: UseFormReturn<any>
  uomUnits: Unit[]
  disabled?: boolean
}

export function UOMFields({ form, uomUnits, disabled = false }: UOMFieldsProps) {
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
    <div className='space-y-4'>
      {/* Purchase UOM Field */}
      <FormField
        control={form.control}
        name='purchase_uom_id'
        rules={{ required: 'Purchase UOM is required' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Purchase UOM <span className='text-red-500'>*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select UOM' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {uomUnits.map(unit => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* UOM Info */}
      <div className='space-y-2'>
        <FormLabel>UOM Info</FormLabel>
        <div className='grid grid-cols-3 gap-2'>
          <FormField
            control={form.control}
            name='unit_per_pallet'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type='number' placeholder='Unit/Pallet' {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='piece_per_uom'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type='number' placeholder='Piece/Unit' {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='weight_per_uom'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type='number' placeholder='Weight/Unit' {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Coverage per UOM */}
      <div className='space-y-2'>
        <FormLabel>
          Coverage per UOM
          {/* <span className='text-red-500'>*</span> */}
        </FormLabel>
        <div className='grid grid-cols-2 gap-2'>
          <FormField
            control={form.control}
            name='coverage_per_rate'
            rules={{
              validate: value => {
                if (value === '' || value === null || value === undefined) {
                  return true
                }

                return Number(value) > 0 || 'Coverage rate must be greater than 0'
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type='text' step='0.01' placeholder='Coverage Rate' {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='coverage_per_unit_id'
            
            // rules={{ required: 'Unit is required' }}
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value || ''} disabled={disabled}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select Unit' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {uomUnits.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>
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
    </div>
  )
}
