'use client'

import { WarehousePayload, WarehouseFormValues, CreateOrEditWarehouseModalProps } from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useEffect, useState, useMemo } from 'react'
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
      title: values.title,
      email: values.email,
      phone: values.phone,
      fax_number: values.fax_number,
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
      toast.error(error?.message || 'Operation failed')
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

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading warehouse...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create Warehouse' : 'Edit Warehouse'}
      description={mode === 'create' ? 'Add a new warehouse' : 'Update warehouse information'}
      maxWidth='3xl'
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
          {/* Basic Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Location Multi-select */}
            <FormField
              control={form.control}
              name='location_id'
              rules={{
                required: 'At least one location is required',
                validate: value => value.length > 0 || 'At least one location is required'
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Accessible Locations <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={businessLocations.map(loc => ({
                        value: loc.id.toString(),
                        label: loc.name
                      }))}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder='Select locations'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name='title'
              rules={{
                required: 'Warehouse title is required',
                minLength: { value: 2, message: 'Title must be at least 2 characters' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Warehouse Title <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter warehouse title' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
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
                    <Input type='email' placeholder='Enter email' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type='tel' placeholder='Enter phone' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fax Number */}
            <FormField
              control={form.control}
              name='fax_number'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fax Number</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter fax number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tax Rate */}
            <FormField
              control={form.control}
              name='tax_rate'
              rules={{
                min: { value: 0, message: 'Tax rate must be at least 0' },
                max: { value: 100, message: 'Tax rate cannot exceed 100' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      max={100}
                      step={0.01}
                      placeholder='0.00'
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Location Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Country */}
            <FormField
              control={form.control}
              name='country_id'
              rules={{
                required: 'Country is required'
              }}
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
                      {countriesWithStateAndCities.map(country => (
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
              rules={{
                required: 'State is required'
              }}
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
              rules={{
                required: 'City is required'
              }}
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

            {/* Zip Code */}
            <FormField
              control={form.control}
              name='zip_code'
              rules={{
                required: 'Zip code is required'
              }}
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

            {/* Street - Full Width */}
            <div className='md:col-span-2'>
              <FormField
                control={form.control}
                name='street'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter street address' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditWarehouseModal
