'use client'

import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { VendorPayload, CreateOrEditVendorModalProps, Vendor } from '@/types'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import CustomFormField from '@/components/form/CustomFormField'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import VendorService from '@/services/api/vendors/vendors.service'
import { Separator } from '@/components/ui/separator'

interface VendorFormValues {
  first_name: string
  email: string
  password: string
  number: string
  phone: string
  fax_number: string
  website: string
  payment_term_id: string
  tax_type: string
  note: string
  country_id: string
  state_id: string
  city_id: string
  zip_code: string
  street_address: string
  is_enable_b2b: boolean
  b2b_host_url: string
  b2b_port_number: string
  b2b_vendor_id: string
  b2b_username: string
  b2b_password: string
  b2b_vendor_folder: string
  profit_margin: number | string
}

const CreateOrEditVendorModal = ({
  mode = 'create',
  open,
  onOpenChange,
  paymentTerms,
  taxTypes,
  countriesWithStatesAndCities,
  vendorId,
  vendorDetails,
  onSuccess
}: CreateOrEditVendorModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<VendorFormValues>({
    defaultValues: {
      first_name: vendorDetails?.first_name || '',
      email: vendorDetails?.email || '',
      password: '',
      number: vendorDetails?.userable?.number || '',
      phone: vendorDetails?.userable?.phone || '',
      fax_number: vendorDetails?.userable?.fax_number || '',
      website: vendorDetails?.userable?.website || '',
      payment_term_id: vendorDetails?.userable?.payment_term_id || '',
      tax_type: vendorDetails?.userable?.tax_type || '',
      note: vendorDetails?.userable?.note || '',
      state_id: vendorDetails?.userable?.state_id?.toString() || '',
      city_id: vendorDetails?.userable?.city_id?.toString() || '',
      zip_code: vendorDetails?.userable?.zip_code || '',
      street_address: vendorDetails?.userable?.street_address || '',
      country_id: vendorDetails?.userable?.city?.country_id?.toString() || '',
      is_enable_b2b: vendorDetails?.userable?.is_enable_b2b === 1 || false,
      b2b_host_url: vendorDetails?.userable?.b2b_host_url || '',
      b2b_port_number: vendorDetails?.userable?.b2b_port_number || '',
      b2b_vendor_id: vendorDetails?.userable?.b2b_vendor_id || '',
      b2b_username: vendorDetails?.userable?.b2b_username || '',
      b2b_password: '',
      b2b_vendor_folder: vendorDetails?.userable?.b2b_vendor_folder || '',
      profit_margin: vendorDetails?.userable?.profit_margin || 0
    }
  })

  // Reset form when vendorDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        first_name: vendorDetails?.first_name || '',
        email: vendorDetails?.email || '',
        password: '',
        number: vendorDetails?.userable?.number || '',
        phone: vendorDetails?.userable?.phone || '',
        fax_number: vendorDetails?.userable?.fax_number || '',
        website: vendorDetails?.userable?.website || '',
        payment_term_id: vendorDetails?.userable?.payment_term_id || '',
        tax_type: vendorDetails?.userable?.tax_type || '',
        note: vendorDetails?.userable?.note || '',
        country_id: vendorDetails?.userable?.city?.country_id?.toString() || '',
        state_id: vendorDetails?.userable?.state_id?.toString() || '',
        city_id: vendorDetails?.userable?.city_id?.toString() || '',
        zip_code: vendorDetails?.userable?.zip_code || '',
        street_address: vendorDetails?.userable?.street_address || '',
        is_enable_b2b: vendorDetails?.userable?.is_enable_b2b === 1 || false,
        b2b_host_url: vendorDetails?.userable?.b2b_host_url || '',
        b2b_port_number: vendorDetails?.userable?.b2b_port_number || '',
        b2b_vendor_id: vendorDetails?.userable?.b2b_vendor_id || '',
        b2b_username: vendorDetails?.userable?.b2b_username || '',
        b2b_password: '',
        b2b_vendor_folder: vendorDetails?.userable?.b2b_vendor_folder || '',
        profit_margin: vendorDetails?.userable?.profit_margin || 0
      })
    }
  }, [vendorDetails, open, form])

  // Watch country and state selection
  const selectedCountryId = form.watch('country_id')
  const selectedStateId = form.watch('state_id')
  const isB2BEnabled = form.watch('is_enable_b2b')

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

  const handleApiError = (error: any, fallbackMessage: string) => {
    setIsLoading(false)

    if (error?.errors && typeof error.errors === 'object') {
      // Map Laravel validation errors to form fields
      Object.entries(error.errors).forEach(([field, messages]) => {
        const msg = Array.isArray(messages) ? messages[0] : String(messages)

        form.setError(field as keyof VendorFormValues, { type: 'server', message: msg })
      })

      if (error.message) {
        toast.error(error.message)
      }
    } else {
      toast.error(typeof error.message === 'string' ? error.message : fallbackMessage)
    }
  }

  const onSubmit = async (values: VendorFormValues) => {
    setIsLoading(true)

    const payload: VendorPayload = {
      first_name: values.first_name,
      last_name: '',
      address: '',
      email: values.email,
      password: values.password,
      number: values.number,
      phone: values.phone,
      fax_number: values.fax_number,
      website: values.website,
      payment_term_id: values.payment_term_id,
      tax_type: values.tax_type,
      note: values.note,
      state_id: values.state_id,
      city_id: values.city_id,
      zip_code: values.zip_code,
      street_address: values.street_address,
      is_enable_b2b: values.is_enable_b2b ? 1 : 0,
      b2b_host_url: values.b2b_host_url || '',
      b2b_port_number: values.b2b_port_number || '',
      b2b_vendor_id: values.b2b_vendor_id || '',
      b2b_username: values.b2b_username || '',
      b2b_password: values.b2b_password || '',
      profit_margin: Number(values.profit_margin)
    }

    try {
      if (mode === 'create') {
        VendorService.store(payload)
          .then(response => {
            toast.success('Vendor created successfully')
            setIsLoading(false)
            onOpenChange(false)
            onSuccess?.()
            form.reset()
          })
          .catch(error => handleApiError(error, 'Failed to create vendor'))
      } else if (mode === 'edit' && vendorId) {
        VendorService.update(vendorId, payload)
          .then(response => {
            toast.success('Vendor updated successfully')
            setIsLoading(false)
            onOpenChange(false)
            onSuccess?.()
            form.reset()
          })
          .catch(error => handleApiError(error, 'Failed to update vendor'))
      }
    } catch (error: any) {
      toast.error('Something went wrong!')
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  const {
    register,
    control,
    formState: { errors }
  } = form

  const sharedFieldClass = 'grid grid-cols-[116px_minmax(0,_1fr)] gap-2'
  const sharedLabelClass = 'justify-end items-start self-start text-right pt-1.5'

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Processing vendor...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Add New Vendor' : 'Edit Vendor'}
      description={mode === 'create' ? 'Create a new vendor' : 'Update vendor information'}
      maxWidth='5xl'
      disableClose={isLoading}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' size='sm' onClick={onCancel} disabled={isLoading} className='flex-1'>
            Cancel
          </Button>
          <Button type='submit' size='sm' onClick={form.handleSubmit(onSubmit)} disabled={isLoading} className='flex-1'>
            {isLoading ? 'Saving...' : mode === 'create' ? 'Save' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* Basic Information */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 items-start'>
            {/* Vendor Name */}
            <CustomFormField
              type='text'
              name='first_name'
              label='Vendor Name'
              placeholder='Enter vendor name'
              register={register}
              errors={errors}
              rules={{
                required: 'Vendor name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              }}
              fieldClassName={sharedFieldClass}
              labelClassName={sharedLabelClass}
            />

            {/* Account Number */}
            <CustomFormField
              type='text'
              name='number'
              label='Acc. Number'
              placeholder='Account number'
              register={register}
              errors={errors}
              fieldClassName={sharedFieldClass}
              labelClassName={sharedLabelClass}
            />

            {/* Phone */}
            <CustomFormField
              type='tel'
              name='phone'
              label='Phone'
              placeholder='Phone number'
              register={register}
              errors={errors}
              fieldClassName={sharedFieldClass}
              labelClassName={sharedLabelClass}
            />

            {/* Fax */}
            <CustomFormField
              type='tel'
              name='fax_number'
              label='Fax'
              placeholder='Fax Number'
              register={register}
              errors={errors}
              fieldClassName={sharedFieldClass}
              labelClassName={sharedLabelClass}
            />

            {/* Account Password */}
            <CustomFormField
              type='password'
              name='password'
              label='Account Password'
              placeholder={mode === 'edit' ? 'Leave blank to keep current' : 'Enter password'}
              register={register}
              errors={errors}
              rules={{
                required: mode === 'create' ? 'Password is required' : false
              }}
              fieldClassName={sharedFieldClass}
              labelClassName={sharedLabelClass}
            />

            {/* Website */}
            <CustomFormField
              type='text'
              name='website'
              label='Website'
              placeholder='https://example.com'
              register={register}
              errors={errors}
              fieldClassName={sharedFieldClass}
              labelClassName={sharedLabelClass}
            />

            {/* Tax Type */}
            <CustomFormField
              type='select'
              name='tax_type'
              label='Tax Type'
              placeholder='Select tax type'
              control={control}
              errors={errors}
              rules={{ required: 'Tax type is required' }}
              selectOptions={taxTypes.map(taxType => ({
                value: taxType.slug,
                label: taxType.name
              }))}
              fieldClassName={sharedFieldClass}
              labelClassName={sharedLabelClass}
            />

            {/* Email */}
            <CustomFormField
              type='email'
              name='email'
              label='Email'
              placeholder='email@example.com'
              register={register}
              errors={errors}
              rules={{
                required: 'Email is required'
              }}
              fieldClassName={sharedFieldClass}
              labelClassName={sharedLabelClass}
            />

            {/* Payment Term */}
            <CustomFormField
              type='select'
              name='payment_term_id'
              label='Payment Term'
              placeholder='Select payment term'
              control={control}
              errors={errors}
              rules={{ required: 'Payment term is required' }}
              selectOptions={paymentTerms.map(term => ({
                value: term.id,
                label: term.name
              }))}
              fieldClassName={sharedFieldClass}
              labelClassName={sharedLabelClass}
            />

            {/* Notes - Full Width */}
            <CustomFormField
              type='textarea'
              name='note'
              label='Notes'
              placeholder='Enter notes'
              register={register}
              errors={errors}
              fieldClassName={`${sharedFieldClass} md:col-span-2`}
              labelClassName={sharedLabelClass}
            />
          </div>

          <Separator />

          {/* B2B Section */}
          <div className='space-y-4'>
            <CustomFormField
              type='checkbox'
              name='is_enable_b2b'
              label='Enable B2B'
              value={form.watch('is_enable_b2b')}
              onChange={(val: any) => form.setValue('is_enable_b2b', !!val)}
              errors={errors}
              fieldClassName='pl-[124px]'
            />

            {isB2BEnabled && (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pl-7 items-start'>
                <CustomFormField
                  type='text'
                  name='b2b_host_url'
                  label='B2B Host URL'
                  placeholder='Enter host URL'
                  register={register}
                  errors={errors}
                  fieldClassName={sharedFieldClass}
                  labelClassName={sharedLabelClass}
                />

                <CustomFormField
                  type='text'
                  name='b2b_port_number'
                  label='B2B Port Number'
                  placeholder='Enter port number'
                  register={register}
                  errors={errors}
                  fieldClassName={sharedFieldClass}
                  labelClassName={sharedLabelClass}
                />

                <CustomFormField
                  type='text'
                  name='b2b_vendor_id'
                  label='B2B Vendor ID'
                  placeholder='Enter vendor ID'
                  register={register}
                  errors={errors}
                  fieldClassName={sharedFieldClass}
                  labelClassName={sharedLabelClass}
                />

                <CustomFormField
                  type='text'
                  name='b2b_username'
                  label='B2B Username'
                  placeholder='Enter username'
                  register={register}
                  errors={errors}
                  fieldClassName={sharedFieldClass}
                  labelClassName={sharedLabelClass}
                />

                <CustomFormField
                  type='password'
                  name='b2b_password'
                  label='B2B Password'
                  placeholder={mode === 'edit' ? 'Leave blank to keep current' : 'Enter password'}
                  register={register}
                  errors={errors}
                  fieldClassName={sharedFieldClass}
                  labelClassName={sharedLabelClass}
                />

                <CustomFormField
                  type='number'
                  name='profit_margin'
                  label='Profit Margin (%)'
                  placeholder='0.00'
                  register={register}
                  errors={errors}
                  fieldClassName={sharedFieldClass}
                  labelClassName={sharedLabelClass}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Location Information */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 items-start'>
            {/* Country */}
            <CustomFormField
              type='select'
              name='country_id'
              label='Country'
              placeholder='Select country'
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

            {/* State */}
            <CustomFormField
              type='combobox'
              name='state_id'
              label='State'
              placeholder={!selectedCountryId ? 'Please select a country first' : 'Select state'}
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

            {/* City */}
            <CustomFormField
              type='combobox'
              name='city_id'
              label='City'
              placeholder={!selectedStateId ? 'Please select a state first' : 'Select city'}
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

            {/* Zip Code */}
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

            {/* Street Address - Full Width */}
            <CustomFormField
              type='text'
              name='street_address'
              label='Street Address'
              placeholder='Enter street address'
              register={register}
              errors={errors}
              fieldClassName={`${sharedFieldClass} md:col-span-2`}
              labelClassName={sharedLabelClass}
            />
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditVendorModal
