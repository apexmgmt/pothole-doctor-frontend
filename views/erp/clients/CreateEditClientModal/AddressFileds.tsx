'use client'

import React, { useCallback, useEffect, useMemo } from 'react'

import { Controller, UseFormReturn } from 'react-hook-form'

import { useLoadScript, Autocomplete } from '@react-google-maps/api'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { MultiSelect, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { ClientPayload, CountryWithStates, ServiceType } from '@/types'
import { Textarea } from '@/components/ui/textarea'

interface AddressFieldsProps {
  methods: UseFormReturn<ClientPayload>
  countriesWithStatesAndCities: CountryWithStates[]
}

const libraries: 'places'[] = ['places']

const AddressFields: React.FC<AddressFieldsProps> = ({ methods, countriesWithStatesAndCities }) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch
  } = methods

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  })

  const [autocomplete, setAutocomplete] = React.useState<google.maps.places.Autocomplete | null>(null)

  // Watch country and state selection
  const selectedCountryId = watch('country_id')
  const selectedStateId = watch('state_id')

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
    if (selectedCountryId) {
      const stateExists = availableStates.some(s => s.id.toString() === watch('state_id'))

      if (!stateExists) {
        setValue('state_id', '')
        setValue('city_id', '')
      }
    }
  }, [selectedCountryId, availableStates, setValue, watch])

  // Reset city when state changes
  useEffect(() => {
    if (selectedStateId) {
      const cityExists = availableCities.some(c => c.id.toString() === watch('city_id'))

      if (!cityExists) {
        setValue('city_id', '')
      }
    }
  }, [selectedStateId, availableCities, setValue, watch])

  const onLoad = useCallback((autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance)
  }, [])

  const onPlaceChanged = useCallback(() => {
    if (autocomplete) {
      const place = autocomplete.getPlace()

      if (place.formatted_address) {
        setValue('address', place.formatted_address)
      }

      // Extract address components
      const addressComponents = place.address_components

      if (addressComponents) {
        let countryName = ''
        let stateName = ''
        let cityName = ''
        let zipCode = ''

        addressComponents.forEach(component => {
          const types = component.types

          if (types.includes('country')) {
            countryName = component.long_name
          }

          if (types.includes('administrative_area_level_1')) {
            stateName = component.long_name
          }

          if (types.includes('locality') || types.includes('administrative_area_level_2')) {
            cityName = component.long_name
          }

          if (types.includes('postal_code')) {
            zipCode = component.long_name
          }
        })

        // Set zip code
        if (zipCode) {
          setValue('zip_code', zipCode)
        }

        // Match and set country
        if (countryName) {
          const matchedCountry = countriesWithStatesAndCities.find(
            country => country.name.toLowerCase() === countryName.toLowerCase()
          )

          if (matchedCountry) {
            setValue('country_id', matchedCountry.id.toString())

            // Match and set state
            if (stateName) {
              const matchedState = matchedCountry.states.find(
                state => state.name.toLowerCase() === stateName.toLowerCase()
              )

              if (matchedState) {
                setValue('state_id', matchedState.id.toString())

                // Match and set city
                if (cityName) {
                  const matchedCity = matchedState.cities.find(
                    city => city.name.toLowerCase() === cityName.toLowerCase()
                  )

                  if (matchedCity) {
                    setValue('city_id', matchedCity.id.toString())
                  }
                }
              }
            }
          }
        }
      }
    }
  }, [autocomplete, setValue, countriesWithStatesAndCities])

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        {/* Address Title */}
        <div className='space-y-2 col-span-2'>
          <Label htmlFor='address_title'>Address Title</Label>
          <Controller
            name='address_title'
            control={control}
            render={({ field }) => <Input {...field} placeholder='e.g. Home, Office' />}
          />
          {errors.address_title && <p className='text-sm text-red-500'>{errors.address_title.message}</p>}
        </div>

        {/* Search Location */}
        <div className='space-y-2 col-span-2'>
          <Label htmlFor='address-search'>Search Location</Label>
          {isLoaded ? (
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
              <Input type='text' placeholder='Search for an address...' />
            </Autocomplete>
          ) : (
            <Input type='text' placeholder='Loading...' disabled />
          )}
        </div>

        <div className='space-y-2 col-span-2'>
          <Label htmlFor='address'>Street Address</Label>
          <Controller
            name='address'
            control={control}
            render={({ field }) => <Textarea {...field} placeholder='Enter address' rows={3} />}
          />
          {errors.address && <p className='text-sm text-red-500'>{errors.address.message}</p>}
        </div>

        {/* Country */}
        <div className='space-y-2'>
          <Label htmlFor='country_id'>Country</Label>
          <Controller
            name='country_id'
            control={control}
            rules={{ required: 'Country is required' }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select a country' />
                </SelectTrigger>
                <SelectContent>
                  {countriesWithStatesAndCities.map(country => (
                    <SelectItem key={country.id} value={country.id.toString()}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.country_id && <p className='text-sm text-red-500'>{errors.country_id.message}</p>}
        </div>

        {/* State */}
        <div className='space-y-2'>
          <Label htmlFor='state_id'>State</Label>
          <Controller
            name='state_id'
            control={control}
            rules={{ required: 'State is required' }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedCountryId || availableStates.length === 0}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select a state' />
                </SelectTrigger>
                <SelectContent>
                  {availableStates.length === 0 ? (
                    <div className='px-2 py-1.5 text-sm text-muted-foreground'>
                      {!selectedCountryId ? 'Please select a country first' : 'No states available'}
                    </div>
                  ) : (
                    availableStates.map(state => (
                      <SelectItem key={state.id} value={state.id.toString()}>
                        {state.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.state_id && <p className='text-sm text-red-500'>{errors.state_id.message}</p>}
        </div>

        {/* City */}
        <div className='space-y-2'>
          <Label htmlFor='city_id'>City</Label>
          <Controller
            name='city_id'
            control={control}
            rules={{ required: 'City is required' }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedStateId || availableCities.length === 0}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select a city' />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.length === 0 ? (
                    <div className='px-2 py-1.5 text-sm text-muted-foreground'>
                      {!selectedStateId ? 'Please select a state first' : 'No cities available'}
                    </div>
                  ) : (
                    availableCities.map(city => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.city_id && <p className='text-sm text-red-500'>{errors.city_id.message}</p>}
        </div>

        {/* Zip Code */}
        <div className='space-y-2'>
          <Label htmlFor='zip_code'>Zip Code</Label>
          <Controller
            name='zip_code'
            control={control}
            render={({ field }) => <Input {...field} placeholder='Enter zip code' />}
          />
          {errors.zip_code && <p className='text-sm text-red-500'>{errors.zip_code.message}</p>}
        </div>
      </div>
    </div>
  )
}

export default AddressFields
