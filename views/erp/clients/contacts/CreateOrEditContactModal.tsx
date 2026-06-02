import React, { useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import CustomFormField from '@/components/form/CustomFormField'
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

  const fieldStyle = 'grid grid-cols-[100px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

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
          <CustomFormField
            type='text'
            register={form.register}
            name='name'
            label='Name'
            placeholder='Full name'
            rules={{ required: 'Name is required' }}
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
          {/* <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'> */}
          <CustomFormField
            type='email'
            register={form.register}
            name='email'
            label='Email'
            placeholder='Email'
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            }}
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
          <CustomFormField
            type='tel'
            register={form.register}
            name='phone'
            label='Phone'
            placeholder='Phone'
            rules={{
              required: 'Phone is required',
              pattern: {
                value: /^[0-9+\-() ]+$/,
                message: 'Invalid phone number'
              }
            }}
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
          {/* </div> */}
          <CustomFormField
            type='text'
            register={form.register}
            name='address'
            label='Address'
            placeholder='Address'
            rules={{ required: 'Address is required' }}
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
          {/* <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'> */}
          {/* Country */}
          <CustomFormField
            type='select'
            control={form.control}
            name='country_id'
            label='Country'
            placeholder='Select a country'
            rules={{ required: 'Country is required' }}
            selectOptions={countriesWithStatesAndCities.map(country => ({
              label: country.name,
              value: country.id.toString()
            }))}
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
          {/* State */}
          <CustomFormField
            type='select'
            control={form.control}
            name='state_id'
            label='State'
            placeholder={!selectedCountryId ? 'Select country first' : 'Select a state'}
            rules={{ required: 'State is required' }}
            selectOptions={availableStates.map(state => ({
              label: state.name,
              value: state.id.toString()
            }))}
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting || !selectedCountryId || availableStates.length === 0}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
          {/* City */}
          <CustomFormField
            type='select'
            control={form.control}
            name='city_id'
            label='City'
            placeholder={!selectedStateId ? 'Select state first' : 'Select a city'}
            rules={{ required: 'City is required' }}
            selectOptions={availableCities.map(city => ({
              label: city.name,
              value: city.id.toString()
            }))}
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting || !selectedStateId || availableCities.length === 0}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
          {/* </div> */}
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
