'use client'

import { UseFormReturn } from 'react-hook-form'
import { BusinessLocation, Company } from '@/types'
import CustomFormField from '@/components/form/CustomFormField'

interface BasicInformationFieldsProps {
  form: UseFormReturn<any>
  businessLocations: BusinessLocation[]
  companies: Company[]
  entity?: string
}

export function BasicInformationFields({ form, businessLocations, companies, entity }: BasicInformationFieldsProps) {
  const isIndividual = entity === 'individual'
  const isBusiness = entity === 'business'

  const {
    register,
    control,
    formState: { errors }
  } = form

  const user_type = form.watch('user_type')

  const sharedFieldClass = 'grid grid-cols-[116px_minmax(0,_1fr)] gap-2'
  const sharedLabelClass = 'justify-end items-start self-start text-right pt-1.5'

  return (
    <>
      {/* Row 1: Role (user_type, col-span-2) & Status (col-span-1) */}
      <CustomFormField
        type='radio'
        name='user_type'
        label='Role'
        control={control}
        rules={{ required: 'Role is required' }}
        errors={errors}
        selectOptions={[
          { value: 'contractor', label: 'Contractor' },
          { value: 'referral', label: 'Referral' }
        ]}
        fieldClassName={`${sharedFieldClass} sm:col-span-2 items-center`}
        labelClassName={`${sharedLabelClass} pt-0!`}
      />

      <CustomFormField
        type='radio'
        name='status'
        label='Status'
        value={form.watch('status') ? 'true' : 'false'}
        onChange={(val: any) => form.setValue('status', val === 'true')}
        errors={errors}
        selectOptions={[
          { value: 'true', label: 'Active' },
          { value: 'false', label: 'Disabled' }
        ]}
        fieldClassName={`${sharedFieldClass} items-center`}
        labelClassName={`${sharedLabelClass} pt-0!`}
      />

      {/* Row 2: Location (col-span-1), Company Name (col-span-1), Entity (col-span-1) */}
      <CustomFormField
        type='multiselect'
        name='location_id'
        label='Location'
        placeholder='Select locations'
        control={control}
        errors={errors}
        rules={{
          required: 'Location is required',
          validate: value => (value && value.length > 0) || 'At least one location must be selected'
        }}
        selectOptions={businessLocations.map(loc => ({
          value: loc.id.toString(),
          label: loc.name
        }))}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      <CustomFormField
        type='select-creatable'
        name='company_name'
        label='Company Name'
        placeholder='Select or type company name'
        control={control}
        errors={errors}
        rules={{
          required: isBusiness ? 'Company name is required' : false,
          validate: value => {
            if (entity === 'business' && !value?.trim()) {
              return 'Company name is required'
            }

            return true
          }
        }}
        selectOptions={companies.map(company => ({
          value: company.name,
          label: company.name
        }))}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      {user_type === 'contractor' ? (
        <CustomFormField
          type='radio'
          name='entity'
          label='Entity'
          control={control}
          errors={errors}
          selectOptions={[
            { value: 'individual', label: 'Individual' },
            { value: 'business', label: 'Business' }
          ]}
          fieldClassName={`${sharedFieldClass} items-center`}
          labelClassName={`${sharedLabelClass} pt-0!`}
        />
      ) : (
        <div />
      )}

      {/* Row 3: First Name, Last Name, Email Confirmation */}
      <CustomFormField
        type='text'
        name='first_name'
        label='First Name'
        placeholder='Enter first name'
        register={register}
        errors={errors}
        rules={{
          required: isIndividual ? 'First name is required' : false,
          validate: value => {
            const normalized = value?.trim() || ''

            if (entity === 'individual' && !normalized) {
              return 'First name is required'
            }

            if (normalized && normalized.length < 2) {
              return 'First name must be at least 2 characters'
            }

            return true
          }
        }}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      <CustomFormField
        type='text'
        name='last_name'
        label='Last Name'
        placeholder='Enter last name'
        register={register}
        errors={errors}
        rules={{
          required: isIndividual ? 'Last name is required' : false,
          validate: value => {
            if (entity === 'individual' && !value?.trim()) {
              return 'Last name is required'
            }

            return true
          }
        }}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      <CustomFormField
        type='checkbox'
        name='is_email_confirmation'
        label='Email Confirmation'
        value={form.watch('is_email_confirmation') === 1}
        onChange={(val: any) => form.setValue('is_email_confirmation', val ? 1 : 0)}
        errors={errors}
        fieldClassName='ps-31'
      />

      {/* Row 4: Email, Phone, SSN */}
      <CustomFormField
        type='email'
        name='email'
        label='Email'
        placeholder='Enter email'
        register={register}
        errors={errors}
        rules={{
          required: 'Email is required'
        }}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      <CustomFormField
        type='tel'
        name='phone'
        label='Phone'
        placeholder='Enter phone'
        register={register}
        errors={errors}
        rules={{
          minLength: { value: 7, message: 'Phone number must be at least 7 characters' }
        }}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      <CustomFormField
        type='text'
        name='ssn'
        label='SSN'
        placeholder='Enter SSN'
        register={register}
        errors={errors}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      {/* Row 5: Fax, Password, EIN */}
      <CustomFormField
        type='tel'
        name='fax'
        label='Fax'
        placeholder='Enter fax'
        register={register}
        errors={errors}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      <CustomFormField
        type='password'
        name='password'
        label='Password'
        placeholder='Enter password'
        register={register}
        errors={errors}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      <CustomFormField
        type='text'
        name='ein'
        label='EIN'
        placeholder='Enter EIN'
        register={register}
        errors={errors}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      {/* Row 6: Two hidden placeholders (Col 1 & Col 2 on md), Notes (Col 3) */}
      <div className='hidden md:block' />
      <div className='hidden md:block' />
      <CustomFormField
        type='textarea'
        name='notes'
        label='Notes'
        placeholder='Enter notes'
        register={register}
        errors={errors}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />
    </>
  )
}
