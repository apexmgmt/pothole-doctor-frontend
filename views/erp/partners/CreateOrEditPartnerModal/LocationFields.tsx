'use client'

import { useMemo, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { CountryWithStates } from '@/types'
import CustomFormField from '@/components/form/CustomFormField'

interface LocationFieldsProps {
  form: UseFormReturn<any>
  countriesWithStatesAndCities: CountryWithStates[]
}

export function LocationFields({ form, countriesWithStatesAndCities }: LocationFieldsProps) {
  const {
    register,
    control,
    formState: { errors }
  } = form

  // Watch country and state selection
  const selectedCountryId = form.watch('country_id')
  const selectedStateId = form.watch('state_id')

  // Get available states based on selected country
  const availableStates = useMemo(() => {
    if (!selectedCountryId) return []
    const country = countriesWithStatesAndCities.find(c => c.id.toString() === selectedCountryId)

    return country?.states || []
  }, [selectedCountryId, countriesWithStatesAndCities])

  // Get available cities based on selected state
  const availableCities = useMemo(() => {
    if (!selectedStateId) return []
    const state = availableStates.find(s => s.id.toString() === selectedStateId)

    return state?.cities || []
  }, [selectedStateId, availableStates])

  // Reset state when country changes
  useEffect(() => {
    if (selectedCountryId && form.getValues('state_id')) {
      const stateExists = availableStates.some(s => s.id.toString() === form.getValues('state_id'))

      if (!stateExists) {
        form.setValue('state_id', '')
        form.setValue('city_id', '')
      }
    }
  }, [selectedCountryId, availableStates, form])

  // Reset city when state changes
  useEffect(() => {
    if (selectedStateId && form.getValues('city_id')) {
      const cityExists = availableCities.some(c => c.id.toString() === form.getValues('city_id'))

      if (!cityExists) {
        form.setValue('city_id', '')
      }
    }
  }, [selectedStateId, availableCities, form])

  const sharedFieldClass = 'grid grid-cols-[116px_minmax(0,_1fr)] gap-2'
  const sharedLabelClass = 'justify-end items-start self-start text-right pt-1.5'

  return (
    <>
      {/* Country Select Field */}
      <CustomFormField
        type='select'
        name='country_id'
        label='Country'
        placeholder='Select a country'
        control={control}
        errors={errors}
        rules={{ required: 'Country is required' }}
        selectOptions={countriesWithStatesAndCities.map(country => ({
          value: country.id.toString(),
          label: country.name
        }))}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      {/* State Select Field */}
      <CustomFormField
        type='combobox'
        name='state_id'
        label='State'
        placeholder={!selectedCountryId ? 'Please select a country first' : 'Select a state'}
        control={control}
        errors={errors}
        rules={{ required: 'State is required' }}
        disabled={!selectedCountryId || availableStates.length === 0}
        selectOptions={availableStates.map(state => ({
          value: state.id.toString(),
          label: state.name
        }))}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      {/* City Select Field */}
      <CustomFormField
        type='combobox'
        name='city_id'
        label='City'
        placeholder={!selectedStateId ? 'Please select a state first' : 'Select a city'}
        control={control}
        errors={errors}
        rules={{ required: 'City is required' }}
        disabled={!selectedStateId || availableCities.length === 0}
        selectOptions={availableCities.map(city => ({
          value: city.id.toString(),
          label: city.name
        }))}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />

      {/* Street Address Field */}
      <div className='md:col-span-2'>
        <CustomFormField
          type='text'
          name='street_address'
          label='Street Address'
          placeholder='Enter street address'
          register={register}
          errors={errors}
          rules={{ required: 'Street address is required' }}
          fieldClassName={sharedFieldClass}
          labelClassName={sharedLabelClass}
        />
      </div>

      {/* Zip Code Field */}
      <CustomFormField
        type='text'
        name='zip_code'
        label='Zip Code'
        placeholder='Enter zip code'
        register={register}
        errors={errors}
        rules={{ required: 'Zip code is required' }}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />
    </>
  )
}
