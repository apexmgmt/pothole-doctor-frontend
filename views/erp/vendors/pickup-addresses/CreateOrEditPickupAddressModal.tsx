'use client'

import { useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { CountryWithStates, VendorPickupAddress, VendorPickupAddressPayload } from '@/types'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import VendorPickupAddressService from '@/services/api/vendors/vendor-pickup-addresses.service'

interface CreateOrEditPickupAddressModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  countriesWithStatesAndCities: CountryWithStates[]
  vendorId: string
  pickupAddressId?: string
  pickupAddressDetails?: VendorPickupAddress
  onSuccess?: () => void
}

interface FormValues {
  title: string
  street_address: string
  state_id: string
  city_id: string
  zip_code: string
  country_id: string
}

const CreateOrEditPickupAddressModal = ({
  mode = 'create',
  open,
  onOpenChange,
  vendorId,
  countriesWithStatesAndCities,
  pickupAddressId,
  pickupAddressDetails,
  onSuccess
}: CreateOrEditPickupAddressModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    defaultValues: {
      title: pickupAddressDetails?.title ?? '',
      street_address: pickupAddressDetails?.street_address ?? '',
      state_id: pickupAddressDetails?.state_id?.toString() ?? '',
      city_id: pickupAddressDetails?.city_id?.toString() ?? '',
      zip_code: pickupAddressDetails?.zip_code ?? '',
      country_id: pickupAddressDetails?.city?.country_id?.toString() ?? ''
    }
  })

  useEffect(() => {
    if (open) {
      form.reset({
        title: pickupAddressDetails?.title ?? '',
        street_address: pickupAddressDetails?.street_address ?? '',
        state_id: pickupAddressDetails?.state_id?.toString() ?? '',
        city_id: pickupAddressDetails?.city_id?.toString() ?? '',
        zip_code: pickupAddressDetails?.zip_code ?? '',
        country_id: pickupAddressDetails?.city?.country_id?.toString() ?? ''
      })
    }
  }, [pickupAddressDetails, open, form])

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

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)

    const payload: VendorPickupAddressPayload | Omit<VendorPickupAddressPayload, 'vendor_id'> =
      mode === 'create'
        ? {
            vendor_id: vendorId,
            title: values.title,
            street_address: values.street_address,
            state_id: values.state_id,
            city_id: values.city_id,
            zip_code: values.zip_code
          }
        : {
            title: values.title,
            street_address: values.street_address,
            state_id: values.state_id,
            city_id: values.city_id,
            zip_code: values.zip_code
          }

    try {
      if (mode === 'create') {
        await VendorPickupAddressService.store(payload as VendorPickupAddressPayload)
        toast.success('Pickup address added successfully')
        form.reset()
        onOpenChange(false)
        onSuccess?.()
      } else if (mode === 'edit' && pickupAddressId) {
        await VendorPickupAddressService.update(pickupAddressId, payload)
        toast.success('Pickup address updated successfully')
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save pickup address')
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Processing pickup address...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Add Pickup Address' : 'Edit Pickup Address'}
      description={mode === 'create' ? 'Add a new pickup address for this vendor.' : 'Update pickup address details.'}
      maxWidth='md'
      disableClose={form.formState.isSubmitting}
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
            {form.formState.isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='title'
            rules={{
              required: 'Title is required',
              minLength: { value: 2, message: 'Title must be at least 2 characters' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Title <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter title' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                      <SelectValue placeholder='Select country' />
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
                      <SelectValue placeholder='Select state' />
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
                      <SelectValue placeholder='Select city' />
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
                  <Input placeholder='Enter street address' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='zip_code'
            rules={{ required: 'Zip code is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Zip Code <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter zip code' {...field} />
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

export default CreateOrEditPickupAddressModal
