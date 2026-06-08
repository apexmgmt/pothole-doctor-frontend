'use client'

import { Controller, UseFormReturn } from 'react-hook-form'
import { PartnerType } from '@/types'
import CustomFormField from '@/components/form/CustomFormField'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import { cn } from '@/lib/utils'

interface ContractorDetailsFieldsProps {
  form: UseFormReturn<any>
  skills: any[]
  partnerTypes: PartnerType[]
}

export function ContractorDetailsFields({ form, skills, partnerTypes }: ContractorDetailsFieldsProps) {
  const {
    register,
    control,
    formState: { errors }
  } = form

  const user_type = form.watch('user_type')

  // Don't render if role is Referral
  if (user_type === 'referral') {
    return null
  }

  const sharedFieldClass = 'grid grid-cols-[116px_minmax(0,_1fr)] gap-2'
  const sharedLabelClass = 'justify-end items-start self-start text-right pt-1.5'

  return (
    <>
      {/* Partner type Field */}
      <CustomFormField
        type='select'
        name='partner_type_id'
        label='Contractor Type'
        placeholder='Select a contractor type'
        control={control}
        errors={errors}
        selectOptions={partnerTypes.map(partnerType => ({
          value: partnerType.id.toString(),
          label: partnerType.name
        }))}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      {/* Skills Field */}
      <CustomFormField
        type='multiselect-creatable'
        name='skills'
        label='Skills'
        placeholder='Select or type to add skills'
        control={control}
        errors={errors}
        selectOptions={skills?.map(skill => ({
          value: skill.name,
          label: skill.name
        }))}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      {/* Schedule Color Field */}
      <CustomFormField
        type='color'
        name='schedule_color'
        label='Schedule Color'
        placeholder='Select schedule color'
        register={register}
        errors={errors}
        className='max-w-24 h-7! p-0.5'
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      {/* In House Contractor Checkbox */}
      <CustomFormField
        type='checkbox'
        name='in_house_contractor'
        label='In House Contractor'
        value={form.watch('in_house_contractor') === 1}
        onChange={(val: any) => form.setValue('in_house_contractor', val ? 1 : 0)}
        errors={errors}
        fieldClassName='ps-31'
      />

      {/* Insurance Expiration Field */}
      <Field className={sharedFieldClass}>
        <FieldLabel className={cn('text-xs font-normal leading-tight gap-0', sharedLabelClass)}>
          Insurance Expiration
        </FieldLabel>
        <div>
          <Controller
            name='insurance_expiration'
            control={control}
            render={({ field }) => (
              <DateTimePicker
                value={field.value ? Number(field.value) : null}
                onChange={val => field.onChange(val)}
                placeholder='Select insurance expiration date & time'
              />
            )}
          />
          {errors.insurance_expiration && (
            <FieldError className='mt-1 text-xs!'>{String(errors.insurance_expiration?.message)}</FieldError>
          )}
        </div>
      </Field>

      {/* WCB Expiration Field */}
      <Field className={sharedFieldClass}>
        <FieldLabel className={cn('text-xs font-normal leading-tight gap-0', sharedLabelClass)}>
          WCB Expiration
        </FieldLabel>
        <div>
          <Controller
            name='w9_expiration'
            control={control}
            render={({ field }) => (
              <DateTimePicker
                value={field.value ? Number(field.value) : null}
                onChange={val => field.onChange(val)}
                placeholder='Select WCB expiration date & time'
              />
            )}
          />
          {errors.w9_expiration && (
            <FieldError className='mt-1 text-xs!'>{String(errors.w9_expiration?.message)}</FieldError>
          )}
        </div>
      </Field>
    </>
  )
}
