'use client'

import { useEffect, useMemo } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { City, CityPayload, CountryWithStates } from '@/types'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import CityService from '@/services/api/locations/city.service'
import CustomFormField from '@/components/form/CustomFormField'

interface CreateOrEditCityModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  cityId?: string
  cityDetails?: City
  onSuccess?: () => void
  countriesWithStateAndCities: CountryWithStates[]
}

const CreateOrEditCityModal = ({
  mode = 'create',
  open,
  onOpenChange,
  cityId,
  cityDetails,
  onSuccess,
  countriesWithStateAndCities
}: CreateOrEditCityModalProps) => {
  const form = useForm<CityPayload>({
    defaultValues: {
      name: cityDetails?.name || '',
      country_id: cityDetails?.state?.country?.id?.toString() || '',
      state_id: cityDetails?.state?.id?.toString() || ''
    }
  })

  const {
    watch,
    reset,
    getValues,
    setValue,
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = form

  // Watch country_id to filter states
  const selectedCountryId = watch('country_id')

  // Get states based on selected country
  const availableStates = useMemo(() => {
    if (!selectedCountryId) return []
    const selectedCountry = countriesWithStateAndCities.find(country => country.id.toString() === selectedCountryId)

    return selectedCountry?.states || []
  }, [selectedCountryId, countriesWithStateAndCities])

  // Reset state_id when country changes
  useEffect(() => {
    if (selectedCountryId) {
      const currentStateId = getValues('state_id')
      const isStateInCountry = availableStates.some(state => state.id.toString() === currentStateId)

      // Only reset if the current state is not in the newly selected country
      if (!isStateInCountry && !cityDetails) {
        setValue('state_id', '')
      }
    }
  }, [selectedCountryId, availableStates, form, cityDetails])

  // Reset form when cityDetails changes or modal opens
  useEffect(() => {
    if (open) {
      // fetchCountriesWithStateAndCities()
      reset({
        name: cityDetails?.name || '',
        country_id: cityDetails?.state?.country?.id?.toString() || '',
        state_id: cityDetails?.state?.id?.toString() || ''
      })
    }
  }, [cityDetails, open, form])

  const onSubmit = async (formData: CityPayload) => {
    if (mode === 'create') {
      try {
        await CityService.store(formData)
          .then(response => {
            toast.success('City created successfully')
            reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create city')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the city!')
      }
    } else if (mode === 'edit' && cityId) {
      try {
        await CityService.update(cityId, formData)
          .then(response => {
            toast.success('City updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update city')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the city!')
      }
    }
  }

  const onCancel = () => {
    reset({
      name: cityDetails?.name || '',
      country_id: cityDetails?.state?.country?.id?.toString() || '',
      state_id: cityDetails?.state?.id?.toString() || ''
    })
    onOpenChange(false)
  }

  const fieldStyle = 'grid grid-cols-[88px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  return (
    <CommonDialog
      loadingMessage='Loading locations...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New City' : 'Edit City'}
      description={mode === 'create' ? 'Add a new city to the system' : 'Update city information'}
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
            required: 'Please select a country',
            minLength: {
              value: 1,
              message: 'Please select a country'
            }
          }}
          selectOptions={countriesWithStateAndCities.map(country => ({
            label: country.name,
            value: country.id.toString()
          }))}
          errors={errors}
          fieldClassName={fieldStyle}
          labelClassName={labelStyle}
        />

        {/* State Select Field */}
        <CustomFormField
          name='state_id'
          type='combobox'
          label='State'
          disabled={!selectedCountryId || availableStates.length === 0}
          placeholder='Select a state'
          control={control}
          rules={{
            required: 'Please select a state',
            minLength: {
              value: 1,
              message: 'Please select a state'
            }
          }}
          selectOptions={availableStates.map(state => ({
            label: state.name,
            value: state.id.toString()
          }))}
          errors={errors}
          fieldClassName={fieldStyle}
          labelClassName={labelStyle}
        />

        {/* City Name Field */}
        <CustomFormField
          name='name'
          label='City Name'
          placeholder='Enter city name'
          register={register}
          rules={{
            required: 'Please enter a city name',
            minLength: {
              value: 2,
              message: 'City name must be at least 2 characters'
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

export default CreateOrEditCityModal
