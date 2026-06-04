import React, { useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import CustomFormField from '@/components/form/CustomFormField'
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

  const fieldStyle = 'grid grid-cols-[100px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

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
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
          <CustomFormField
            type='text'
            register={form.register}
            name='title'
            label='Title'
            placeholder='Address title (e.g. Home, Office)'
            rules={{ required: 'Title is required' }}
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
          <CustomFormField
            type='text'
            register={form.register}
            name='street_address'
            label='Street Address'
            placeholder='Street address'
            rules={{ required: 'Street address is required' }}
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
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
          <CustomFormField
            type='text'
            register={form.register}
            name='zip_code'
            label='Zip Code'
            placeholder='Zip Code'
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
          <CustomFormField
            type='select'
            control={form.control}
            name='is_default'
            label='Default Address'
            selectOptions={[
              { label: 'Yes', value: '1' },
              { label: 'No', value: '0' }
            ]}
            value={String(form.watch('is_default') ?? 0)}
            onChange={val => form.setValue('is_default', Number(val), { shouldDirty: true })}
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditAddressModal
