import React, { useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { ClientContact, ClientContactPayload, CountryWithStates } from '@/types'

import ClientContactService from '@/services/api/clients/client-contacts.service'

interface CreateOrEditContactModalProps {
  mode?: 'create' | 'edit'
  isOpen: boolean
  onClose: () => void
  clientId: string
  contact_id?: string | null
  contact?: ClientContact | null
  countriesWithStatesAndCities: CountryWithStates[]
  onSuccess: () => void
}

const CreateOrEditContactModal: React.FC<CreateOrEditContactModalProps> = ({
  mode = 'create',
  isOpen,
  onClose,
  clientId,
  contact_id,
  contact,
  countriesWithStatesAndCities,
  onSuccess
}) => {
  const form = useForm<ClientContactPayload>({
    defaultValues: {
      client_id: clientId,
      name: contact?.name || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      address: contact?.address || '',

      // zip_code: contact?.zip_code || '',
      country_id: contact?.country_id.toString() || '',
      state_id: contact?.state_id.toString() || '',
      city_id: contact?.city_id.toString() || ''
    }
  })

  // Reset form when modal opens or contact changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        client_id: clientId,
        name: contact?.name || '',
        email: contact?.email || '',
        phone: contact?.phone || '',
        address: contact?.address || '',

        // zip_code: contact?.zip_code || '',
        country_id: contact?.country_id.toString() || '',
        state_id: contact?.state_id.toString() || '',
        city_id: contact?.city_id.toString() || ''
      })
    }
  }, [isOpen, contact, clientId, form])

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

  const onSubmit = async (values: ClientContactPayload) => {
    try {
      if (mode === 'edit' && contact_id) {
        await ClientContactService.update(contact_id, values)
        toast.success('Contact updated successfully')
      } else {
        await ClientContactService.store(values)
        toast.success('Contact created successfully')
      }

      form.reset()
      onSuccess()
      onClose()
    } catch (e: any) {
      toast.error(e.message || 'Failed to save contact')
    }
  }

  const onCancel = () => {
    form.reset({
      client_id: clientId,
      name: contact?.name || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      address: contact?.address || '',

      // zip_code: contact?.zip_code || '',
      country_id: contact?.country_id.toString() || '',
      state_id: contact?.state_id.toString() || '',
      city_id: contact?.city_id.toString() || ''
    })
    onClose()
  }

  return (
    <CommonDialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onCancel()
      }}
      title={mode === 'edit' ? 'Edit Contact' : 'Add Contact'}
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
            disabled={
              form.formState.isSubmitting ||
              !form.watch('name') ||
              !form.watch('email') ||
              !form.watch('phone') ||
              !form.watch('address') ||
              !form.watch('country_id') ||
              !form.watch('state_id') ||
              !form.watch('city_id')
            }
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
            name='name'
            rules={{ required: 'Name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Full name' {...field} />
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
                    <Input type='tel' placeholder='Phone' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name='address'
            rules={{ required: 'Address is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Address <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Address' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          {/* <FormField
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
          /> */}
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditContactModal
