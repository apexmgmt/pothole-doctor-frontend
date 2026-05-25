'use client'

import { useEffect } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { Country, CountryPayload } from '@/types'

import { Button } from '@/components/ui/button'

import CountryService from '@/services/api/locations/country.service'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import CustomFormField from '@/components/form/CustomFormField'

interface CreateOrEditCountryModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  countryId?: string
  countryDetails?: Country
  onSuccess?: () => void
}

const CreateOrEditCountryModal = ({
  mode = 'create',
  open,
  onOpenChange,
  countryId,
  countryDetails,
  onSuccess
}: CreateOrEditCountryModalProps) => {
  const form = useForm<CountryPayload>({
    defaultValues: {
      name: countryDetails?.name || '',
      code: countryDetails?.code || ''
    }
  })

  const {
    reset,
    setValue,
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = form

  // Reset form when countryDetails changes or modal opens
  useEffect(() => {
    if (open) {
      reset({
        name: countryDetails?.name || '',
        code: countryDetails?.code || ''
      })
    }
  }, [countryDetails, open, form])

  const onSubmit = async (values: CountryPayload) => {
    if (mode === 'create') {
      try {
        await CountryService.store(values)
          .then(response => {
            toast.success('Country created successfully')
            reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create country')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the country!')
      }
    } else if (mode === 'edit' && countryId) {
      try {
        await CountryService.update(countryId, values)
          .then(response => {
            toast.success('Country updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update country')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the country!')
      }
    }
  }

  const onCancel = () => {
    reset({
      name: countryDetails?.name || '',
      code: countryDetails?.code || ''
    })
    onOpenChange(false)
  }

  const fieldStyle = 'grid grid-cols-[96px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Country' : 'Edit Country'}
      description={mode === 'create' ? 'Add a new country to the system' : 'Update country information'}
      maxWidth='md'
      disableClose={isSubmitting}
      isLoading={isSubmitting}
      actions={
        <div className='flex gap-3'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onCancel}
            disabled={isSubmitting}
            className='flex-1'
          >
            Cancel
          </Button>
          <Button type='submit' size='sm' onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className='flex-1'>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-2'>
        {/* Country Name Field */}
        <CustomFormField
          name='name'
          label='Country Name'
          placeholder='Enter country name'
          register={register}
          rules={{
            required: 'Country name is required',
            minLength: {
              value: 2,
              message: 'Country name must be at least 2 characters'
            }
          }}
          errors={errors}
          fieldClassName={fieldStyle}
          labelClassName={labelStyle}
        />

        {/* Country Code Field */}
        <CustomFormField
          name='code'
          label='Country Code'
          placeholder='Enter country code (e.g., US, UK)'
          onChange={value => setValue('code', (value as string)?.toUpperCase(), { shouldDirty: true })}
          register={register}
          rules={{
            required: 'Country code is required',
            minLength: {
              value: 2,
              message: 'Country code must be at least 2 characters'
            },
            maxLength: {
              value: 3,
              message: 'Country code must not exceed 3 characters'
            }
          }}
          errors={errors}
          fieldClassName={fieldStyle}
          labelClassName={labelStyle}
        />
      </form>
    </CommonDialog>
  )
}

export default CreateOrEditCountryModal
