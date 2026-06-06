'use client'

import { useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { CountryWithStates, VendorPickupAddress, VendorPickupAddressPayload } from '@/types'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import CustomFormField from '@/components/form/CustomFormField'

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

  const {
    reset,
    watch,
    setValue,
    getValues,
    setError,
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = form

  useEffect(() => {
    if (open) {
      reset({
        title: pickupAddressDetails?.title ?? '',
        street_address: pickupAddressDetails?.street_address ?? '',
        state_id: pickupAddressDetails?.state_id?.toString() ?? '',
        city_id: pickupAddressDetails?.city_id?.toString() ?? '',
        zip_code: pickupAddressDetails?.zip_code ?? '',
        country_id: pickupAddressDetails?.city?.country_id?.toString() ?? ''
      })
    }
  }, [pickupAddressDetails, open, reset])

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
    if (selectedCountryId && getValues('state_id')) {
      const stateExists = availableStates.some(s => s.id.toString() === getValues('state_id'))

      if (!stateExists) {
        setValue('state_id', '')
        setValue('city_id', '')
      }
    }
  }, [selectedCountryId, availableStates, getValues, setValue])

  // Reset city when state changes
  useEffect(() => {
    if (selectedStateId && getValues('city_id')) {
      const cityExists = availableCities.some(c => c.id.toString() === getValues('city_id'))

      if (!cityExists) {
        setValue('city_id', '')
      }
    }
  }, [selectedStateId, availableCities, getValues, setValue])

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
        reset()
        onOpenChange(false)
        onSuccess?.()
      } else if (mode === 'edit' && pickupAddressId) {
        await VendorPickupAddressService.update(pickupAddressId, payload)
        toast.success('Pickup address updated successfully')
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      const serverErrors = error?.errors || {}

      if (serverErrors && typeof serverErrors === 'object') {
        Object.entries(serverErrors).forEach(([field, messages]) => {
          const errMessage = (messages as string[])?.[0]

          setError(field as keyof FormValues, {
            type: 'server',
            message: typeof errMessage === 'string' ? errMessage : ''
          })
        })
      }

      toast.error(error?.message || 'Failed to save pickup address')
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    reset()
    onOpenChange(false)
  }

  const fieldStyle = 'grid grid-cols-[152px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Processing pickup address...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Add Pickup Address' : 'Edit Pickup Address'}
      description={mode === 'create' ? 'Add a new pickup address for this vendor.' : 'Update pickup address details.'}
      maxWidth='4xl'
      disableClose={isSubmitting}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting} className='flex-1'>
            Cancel
          </Button>
          <Button type='submit' onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className='flex-1'>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2'>
          <div className='md:col-span-2'>
            <CustomFormField
              name='title'
              label='Title'
              placeholder='Enter title'
              rules={{
                required: 'Title is required',
                minLength: { value: 2, message: 'Title must be at least 2 characters' }
              }}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />
          </div>
          <div className='md:col-span-2'>
            <CustomFormField
              name='street_address'
              type='textarea'
              label='Street Address'
              placeholder='Enter street address'
              rules={{ required: 'Street address is required' }}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />
          </div>
          <CustomFormField
            name='country_id'
            label='Country'
            type='select'
            placeholder='Select country'
            rules={{ required: 'Country is required' }}
            selectOptions={countriesWithStatesAndCities.map(country => ({
              value: country.id.toString(),
              label: country.name
            }))}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          <CustomFormField
            name='state_id'
            label='State'
            type='select'
            placeholder={!selectedCountryId ? 'Please select a country first' : 'Select state'}
            rules={{ required: 'State is required' }}
            selectOptions={availableStates.map(state => ({
              value: state.id.toString(),
              label: state.name
            }))}
            disabled={!selectedCountryId || availableStates.length === 0}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          <CustomFormField
            name='city_id'
            label='City'
            type='select'
            placeholder={!selectedStateId ? 'Please select a state first' : 'Select city'}
            rules={{ required: 'City is required' }}
            selectOptions={availableCities.map(city => ({
              value: city.id.toString(),
              label: city.name
            }))}
            disabled={!selectedStateId || availableCities.length === 0}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          <CustomFormField
            name='zip_code'
            label='Zip Code'
            placeholder='Enter zip code'
            rules={{ required: 'Zip code is required' }}
            register={register}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditPickupAddressModal
