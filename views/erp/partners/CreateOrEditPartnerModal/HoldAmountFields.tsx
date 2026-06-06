'use client'

import { UseFormReturn } from 'react-hook-form'
import CustomFormField from '@/components/form/CustomFormField'

interface HoldAmountFieldsProps {
  form: UseFormReturn<any>
}

export function HoldAmountFields({ form }: HoldAmountFieldsProps) {
  const {
    register,
    formState: { errors }
  } = form

  const sharedFieldClass = 'grid grid-cols-[116px_minmax(0,_1fr)] gap-2'
  const sharedLabelClass = 'justify-end items-start self-start text-right pt-1.5'

  return (
    <>
      {/* Hold Amount Field */}
      <CustomFormField
        type='number'
        name='hold_amount'
        label='Hold Amount'
        placeholder='Enter hold amount'
        register={register}
        errors={errors}
        rules={{
          required: 'Hold amount is required',
          min: { value: 0, message: 'Hold amount must be at least 0' }
        }}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      {/* Hold Amount Percent Field */}
      <CustomFormField
        type='number'
        name='hold_amount_percent'
        label='Hold Amount Percent (%)'
        placeholder='Enter hold amount percent'
        register={register}
        errors={errors}
        rules={{
          required: 'Hold amount percent is required',
          min: { value: 0, message: 'Percentage must be at least 0' },
          max: { value: 100, message: 'Percentage cannot exceed 100' }
        }}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />
    </>
  )
}
