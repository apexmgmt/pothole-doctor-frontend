'use client'

import { useEffect } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { State, StatePayload, Country } from '@/types'

import { Button } from '@/components/ui/button'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import StateService from '@/services/api/locations/state.service'
import CustomFormField from '@/components/form/CustomFormField'

interface CreateOrEditStateModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  stateId?: string
  stateDetails?: State
  countries: Country[]
  onSuccess?: () => void
}

const CreateOrEditStateModal = ({
  mode = 'create',
  open,
  onOpenChange,
  stateId,
  stateDetails,
  countries,
  onSuccess
}: CreateOrEditStateModalProps) => {
  const form = useForm<StatePayload>({
    defaultValues: {
      name: stateDetails?.name || '',
      country_id: stateDetails?.country?.id?.toString() || ''
    }
  })

  const {
    reset,
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = form

  // Reset form when stateDetails changes or modal opens
  useEffect(() => {
    if (open) {
      // fetchCountriesWithStateAndCities()
      reset({
        name: stateDetails?.name || '',
        country_id: stateDetails?.country?.id?.toString() || ''
      })
    }
  }, [stateDetails, open])

  const onSubmit = async (formValues: StatePayload) => {
    if (mode === 'create') {
      try {
        await StateService.store(formValues)
          .then(response => {
            console.log('State created:', response)
            toast.success('State created successfully')
            reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create state')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the state!')
      }
    } else if (mode === 'edit' && stateId) {
      try {
        await StateService.update(stateId, formValues)
          .then(response => {
            console.log('State updated:', response)
            toast.success('State updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update state')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the state!')
      }
    }
  }

  const onCancel = () => {
    reset({
      name: stateDetails?.name || '',
      country_id: stateDetails?.country?.id?.toString() || ''
    })
    onOpenChange(false)
  }

  const fieldStyle = 'grid grid-cols-[88px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  return (
    <CommonDialog
      loadingMessage='Loading countries...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New State' : 'Edit State'}
      description={mode === 'create' ? 'Add a new state to the system' : 'Update state information'}
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
        {/* Country Select Field */}
        <CustomFormField
          name='country_id'
          type='combobox'
          label='Country'
          placeholder='Select a country'
          control={control}
          rules={{
            required: 'Country is required',
            minLength: {
              value: 1,
              message: 'Please select a country'
            }
          }}
          selectOptions={countries.map(country => ({ label: country.name, value: country.id.toString() }))}
          errors={errors}
          fieldClassName={fieldStyle}
          labelClassName={labelStyle}
        />

        {/* State Name Field */}
        <CustomFormField
          name='name'
          label='State Name'
          placeholder='Enter state name'
          register={register}
          rules={{
            required: 'State name is required',
            minLength: {
              value: 2,
              message: 'State name must be at least 2 characters'
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

export default CreateOrEditStateModal
