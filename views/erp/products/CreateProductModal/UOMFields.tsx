'use client'

import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Unit } from '@/types'
import { useEffect } from 'react'

interface UOMFieldsProps {
  form: UseFormReturn<any>
  uomUnits: Unit[]
}

export function UOMFields({ form, uomUnits }: UOMFieldsProps) {
  // Watch is_rolled_good and set purchase_uom to "Roll" if needed
  const isRolledGood = form.watch('is_rolled_good')

  useEffect(() => {
    if (isRolledGood === 1) {
      const rollUnit = uomUnits.find(u => u.name.toLowerCase() === 'roll')
      if (rollUnit) {
        form.setValue('purchase_uom', rollUnit.name)
      }
    }
  }, [isRolledGood, uomUnits, form])

  return (
    <div className='space-y-4'>
      {/* Purchase UOM Field */}
      <FormField
        control={form.control}
        name='purchase_uom'
        rules={{ required: 'Purchase UOM is required' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Purchase UOM <span className='text-red-500'>*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select UOM' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {uomUnits.map(unit => (
                  <SelectItem key={unit.id} value={unit.name}>
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
            name='uom_info.carton_per_pallet'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type='number' placeholder='Carton/Pallet' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='uom_info.piece_per_carton'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type='number' placeholder='Piece/Carton' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='uom_info.lb'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type='number' placeholder='lb' {...field} />
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
          Coverage per UOM <span className='text-red-500'>*</span>
        </FormLabel>
        <div className='grid grid-cols-2 gap-2'>
          <FormField
            control={form.control}
            name='coverage_per_uom.value'
            rules={{ required: 'Coverage value is required', min: { value: 0, message: 'Must be at least 0' } }}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type='number' step='0.01' placeholder='1.0000' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='coverage_per_uom.unit'
            rules={{ required: 'Unit is required' }}
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
    </div>
  )
}
