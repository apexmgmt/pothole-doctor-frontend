'use client'

import { useMemo, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CountryWithStates } from '@/types'

interface LocationFieldsProps {
  form: UseFormReturn<any>
  countriesWithStatesAndCities: CountryWithStates[]
}

export function LocationFields({ form, countriesWithStatesAndCities }: LocationFieldsProps) {
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

  return (
    <>
      {/* Country Select Field */}
      <FormField
        control={form.control}
        name='country_id'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Country<span className='text-red-500'>*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select a country' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {countriesWithStatesAndCities.map(country => (
                  <SelectItem key={country.id} value={country.id.toString()}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* State Select Field */}
      <FormField
        control={form.control}
        name='state_id'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              State<span className='text-red-500'>*</span>
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={!selectedCountryId || availableStates.length === 0}
            >
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select a state' />
                </SelectTrigger>
              </FormControl>
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
            <FormMessage />
          </FormItem>
        )}
      />

      {/* City Select Field */}
      <FormField
        control={form.control}
        name='city_id'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              City<span className='text-red-500'>*</span>
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={!selectedStateId || availableCities.length === 0}
            >
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select a city' />
                </SelectTrigger>
              </FormControl>
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
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Street Address Field */}
      <div className='col-span-2'>
        <FormField
          control={form.control}
          name='street_address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Street Address<span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Enter street address' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* Zip Code Field */}
      <FormField
        control={form.control}
        name='zip_code'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Zip Code<span className='text-red-500'>*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder='Enter zip code' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
