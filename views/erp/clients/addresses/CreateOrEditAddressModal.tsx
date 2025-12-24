import React, { useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { CountryWithStates, ClientAddress, ClientAddressPayload } from '@/types'
import ClientAddressService from '@/services/api/clients/client-addresses.service'

interface CreateOrEditAddressModalProps {
  mode?: 'create' | 'edit'
  isOpen: boolean
  onClose: () => void
  clientId: string
  address_id?: string | null
  address?: ClientAddress | null
  countriesWithStatesAndCities: CountryWithStates[]
  onSuccess: () => void
}

const CreateOrEditAddressModal: React.FC<CreateOrEditAddressModalProps> = ({
  mode = 'create',
  isOpen,
  onClose,
  clientId,
  address_id,
  address,
  countriesWithStatesAndCities,
  onSuccess
}) => {
  const form = useForm<ClientAddressPayload>({
    defaultValues: {
      client_id: clientId,
      title: address?.title || '',
      street_address: address?.street_address || '',
      phone: address?.phone || '',
      zip_code: address?.zip_code || '',
      country_id: address?.city?.country_id?.toString() || '',
      state_id: address?.state_id.toString() || '',
      city_id: address?.city_id.toString() || '',
      is_default: address?.is_default || 0,
      email: address?.email || ''
    }
  })

  // Reset form when modal opens or contact changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        client_id: clientId,
        title: address?.title || '',
        street_address: address?.street_address || '',
        phone: address?.phone || '',
        zip_code: address?.zip_code || '',
        country_id: address?.city?.country_id?.toString() || '',
        state_id: address?.state_id.toString() || '',
        city_id: address?.city_id.toString() || '',
        is_default: address?.is_default || 0,
        email: address?.email || ''
      })
    }
  }, [isOpen, address, clientId, form])

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

  const onSubmit = async (values: ClientAddressPayload) => {
    try {
      // Remove country_id from payload
      const { country_id, ...payload } = values

      if (mode === 'edit' && address_id) {
        await ClientAddressService.update(address_id, payload)
        toast.success('Address updated successfully')
      } else {
        await ClientAddressService.store(payload)
        toast.success('Address created successfully')
      }

      form.reset()
      onSuccess()
      onClose()
    } catch (e: any) {
      toast.error(e.message || 'Failed to save address')
    }
  }

  const onCancel = () => {
    form.reset({
      client_id: clientId,
      title: address?.title || '',
      street_address: address?.street_address || '',
      phone: address?.phone || '',
      zip_code: address?.zip_code || '',
      country_id: address?.city?.country_id?.toString() || '',
      state_id: address?.state_id.toString() || '',
      city_id: address?.city_id.toString() || '',
      is_default: address?.is_default || 0,
      email: address?.email || ''
    })
    onClose()
  }

  return (
    <CommonDialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onCancel()
      }}
      title={mode === 'edit' ? 'Edit Address' : 'Add Address'}
      maxWidth='2xl'
      isLoading={form.formState.isSubmitting}
      actions={
        <div className='flex gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={form.formState.isSubmitting}
            className='flex-1'
          >
            Cancel
          </Button>
          <Button
            type='submit'
            onClick={form.handleSubmit(onSubmit)}
            disabled={form.formState.isSubmitting}
            className='flex-1'
          >
            {form.formState.isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Save'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='title'
            rules={{ required: 'Title is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Title <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Address title (e.g. Home, Office)' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='street_address'
            rules={{ required: 'Street address is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Street Address <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Street address' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='email'
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type='email' placeholder='Email' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='phone'
              rules={{ required: 'Phone is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Phone' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            {/* Country */}
            <FormField
              control={form.control}
              name='country_id'
              rules={{ required: 'Country is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Country <span className='text-red-500'>*</span>
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
            {/* State */}
            <FormField
              control={form.control}
              name='state_id'
              rules={{ required: 'State is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State <span className='text-red-500'>*</span>
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
            {/* City */}
            <FormField
              control={form.control}
              name='city_id'
              rules={{ required: 'City is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City <span className='text-red-500'>*</span>
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
          </div>
          <FormField
            control={form.control}
            name='zip_code'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip Code</FormLabel>
                <FormControl>
                  <Input placeholder='Zip Code' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='is_default'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Address</FormLabel>
                <FormControl>
                  <Select onValueChange={val => field.onChange(Number(val))} value={String(field.value ?? 0)}>
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='1'>Yes</SelectItem>
                      <SelectItem value='0'>No</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditAddressModal
