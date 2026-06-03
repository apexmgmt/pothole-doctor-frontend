'use client'

import { useEffect, useState, useMemo } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { WarehousePayload, WarehouseFormValues, CreateOrEditWarehouseModalProps } from '@/types'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import CustomFormField from '@/components/form/CustomFormField'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import WarehouseService from '@/services/api/warehouses.service'
import { Separator } from '@/components/ui/separator'

const CreateOrEditWarehouseModal = ({
  mode = 'create',
  open,
  onOpenChange,
  businessLocations,
  countriesWithStateAndCities,
  warehouseId,
  warehouseDetails,
  onSuccess
}: CreateOrEditWarehouseModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<WarehouseFormValues>({
    defaultValues: {
      location_id: warehouseDetails?.locations?.map(loc => loc.id.toString()) || [],
      title: warehouseDetails?.title || '',
      email: warehouseDetails?.email || '',
      phone: warehouseDetails?.phone || '',
      fax_number: warehouseDetails?.fax_number || '',
      tax_rate: warehouseDetails?.tax_rate || 0,
      street: warehouseDetails?.street || '',
      state_id: warehouseDetails?.state_id?.toString() || '',
      city_id: warehouseDetails?.city_id?.toString() || '',
      zip_code: warehouseDetails?.zip_code || '',
      country_id: warehouseDetails?.city?.country_id?.toString() || ''
    }
  })

  // Reset form when warehouseDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        location_id: warehouseDetails?.locations?.map(loc => loc.id.toString()) || [],
        title: warehouseDetails?.title || '',
        email: warehouseDetails?.email || '',
        phone: warehouseDetails?.phone || '',
        fax_number: warehouseDetails?.fax_number || '',
        tax_rate: warehouseDetails?.tax_rate || 0,
        street: warehouseDetails?.street || '',
        state_id: warehouseDetails?.state_id?.toString() || '',
        city_id: warehouseDetails?.city_id?.toString() || '',
        zip_code: warehouseDetails?.zip_code || '',
        country_id: warehouseDetails?.city?.country_id?.toString() || ''
      })
    }
  }, [warehouseDetails, open, form])

  // Watch country and state selection
  const selectedCountryId = form.watch('country_id')
  const selectedStateId = form.watch('state_id')

  // Get available states based on selected country
  const availableStates = useMemo(() => {
    if (!selectedCountryId) return []
    const country = countriesWithStateAndCities.find(c => c.id.toString() === selectedCountryId)

    return country?.states || []
  }, [selectedCountryId, countriesWithStateAndCities])

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

  const onSubmit = async (values: WarehouseFormValues) => {
    setIsLoading(true)

    const payload: WarehousePayload = {
      location_id: values.location_id,
      title: values.title.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      fax_number: values.fax_number.trim(),
      tax_rate: Number(values.tax_rate),
      street: values.street,
      state_id: values.state_id,
      city_id: values.city_id,
      zip_code: values.zip_code
    }

    try {
      if (mode === 'create') {
        await WarehouseService.store(payload)
        toast.success('Warehouse created successfully')
      } else if (mode === 'edit' && warehouseId) {
        await WarehouseService.update(warehouseId, payload)
        toast.success('Warehouse updated successfully')
      }

      onOpenChange(false)
      onSuccess?.()
      form.reset()
    } catch (error: any) {
      if (error?.errors && typeof error.errors === 'object') {
        Object.values(error.errors).forEach((errMsg: any) => {
          errMsg?.map((msg: string) => toast.error(msg))
        })
      } else {
        toast.error(error?.message || 'Something went wrong')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    form.reset({
      location_id: warehouseDetails?.locations?.map(loc => loc.id.toString()) || [],
      title: warehouseDetails?.title || '',
      email: warehouseDetails?.email || '',
      phone: warehouseDetails?.phone || '',
      fax_number: warehouseDetails?.fax_number || '',
      tax_rate: warehouseDetails?.tax_rate || 0,
      street: warehouseDetails?.street || '',
      state_id: warehouseDetails?.state_id?.toString() || '',
      city_id: warehouseDetails?.city_id?.toString() || '',
      zip_code: warehouseDetails?.zip_code || '',
      country_id: warehouseDetails?.city?.country_id?.toString() || ''
    })
    onOpenChange(false)
  }

  const fieldStyle = 'grid grid-cols-[152px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  const {
    register,
    control,
    formState: { errors }
  } = form

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading warehouse...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create Warehouse' : 'Edit Warehouse'}
      description={mode === 'create' ? 'Add a new warehouse' : 'Update warehouse information'}
      maxWidth='5xl'
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
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
          {/* Row 1 */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2'>
            <CustomFormField
              name='location_id'
              label='Accessible Locations'
              type='multiselect'
              placeholder='Select locations'
              rules={{
                required: 'At least one location is required',
                validate: value => (Array.isArray(value) && value.length > 0) || 'At least one location is required'
              }}
              selectOptions={businessLocations.map(loc => ({
                value: loc.id.toString(),
                label: loc.name
              }))}
              control={control}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            <CustomFormField
              name='title'
              label='Warehouse Title'
              placeholder='Enter warehouse title'
              rules={{
                required: 'Warehouse title is required',
                minLength: { value: 2, message: 'Title must be at least 2 characters' }
              }}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />
          </div>

          {/* Row 2 */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2'>
            <CustomFormField
              name='phone'
              label='Phone'
              type='tel'
              placeholder='Enter phone'
              rules={{
                required: 'Phone number is required'
              }}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            <CustomFormField
              name='email'
              label='Email'
              type='email'
              placeholder='Enter email'
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />
          </div>

          {/* Row 3 */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2'>
            <CustomFormField
              name='fax_number'
              label='Fax Number'
              placeholder='Enter fax number'
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />
          </div>

          {/* Row 4 */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2'>
            <CustomFormField
              name='tax_rate'
              label='Tax Rate (%)'
              type='number'
              placeholder='0.00'
              rules={{
                min: { value: 0, message: 'Tax rate must be at least 0' },
                max: { value: 100, message: 'Tax rate cannot exceed 100' }
              }}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />
          </div>

          <Separator />

          {/* Row 5 */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2'>
            <CustomFormField
              type='textarea'
              name='street'
              label='Street Address'
              placeholder='Enter street address'
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            <CustomFormField
              name='zip_code'
              label='Zip Code'
              placeholder='Enter zip code'
              rules={{
                required: 'Zip code is required'
              }}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />
          </div>

          {/* Row 6 */}
          <div className='grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr] gap-x-4 gap-y-2'>
            <CustomFormField
              name='country_id'
              label='Country'
              type='select'
              placeholder='Select a country'
              rules={{
                required: 'Country is required'
              }}
              selectOptions={countriesWithStateAndCities.map(country => ({
                value: country.id.toString(),
                label: country.name
              }))}
              control={control}
              errors={errors}
              fieldClassName={`${fieldStyle}`}
              labelClassName={`${labelStyle}`}
            />

            <CustomFormField
              name='state_id'
              label='State'
              type='select'
              placeholder={!selectedCountryId ? 'Please select a country first' : 'Select a state'}
              rules={{
                required: 'State is required'
              }}
              selectOptions={availableStates.map(state => ({
                value: state.id.toString(),
                label: state.name
              }))}
              disabled={!selectedCountryId || availableStates.length === 0}
              control={control}
              errors={errors}
              fieldClassName={`${fieldStyle} grid-cols-[78px_minmax(0,_1fr)]!`}
              labelClassName={`${labelStyle}`}
            />

            <CustomFormField
              name='city_id'
              label='City'
              type='select'
              placeholder={!selectedStateId ? 'Please select a state first' : 'Select a city'}
              rules={{
                required: 'City is required'
              }}
              selectOptions={availableCities.map(city => ({
                value: city.id.toString(),
                label: city.name
              }))}
              disabled={!selectedStateId || availableCities.length === 0}
              control={control}
              errors={errors}
              fieldClassName={`${fieldStyle} grid-cols-[78px_minmax(0,_1fr)]!`}
              labelClassName={`${labelStyle}`}
            />
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditWarehouseModal
