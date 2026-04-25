'use client'

import { useEffect, useState, useMemo } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { VendorPayload, CreateOrEditVendorModalProps, Vendor } from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

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
          .catch(error => {
            setIsLoading(false)
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create vendor')
          })
      } else if (mode === 'edit' && vendorId) {
        VendorService.update(vendorId, payload)
          .then(response => {
            toast.success('Vendor updated successfully')
            setIsLoading(false)
            onOpenChange(false)
            onSuccess?.()
            form.reset()
          })
          .catch(error => {
            setIsLoading(false)
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update vendor')
          })
      }
    } catch (error: any) {
      toast.error('Something went wrong!')
    }
  }

  const onCancel = () => {
    form.reset()
    onOpenChange(false)
  }

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
          <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading} className='flex-1'>
            Cancel
          </Button>
          <Button type='submit' onClick={form.handleSubmit(onSubmit)} disabled={isLoading} className='flex-1'>
            {isLoading ? 'Saving...' : mode === 'create' ? 'Save' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* Basic Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Vendor Name */}
            <FormField
              control={form.control}
              name='first_name'
              rules={{
                required: 'Vendor name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Vendor Name <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter vendor name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Number */}
            <FormField
              control={form.control}
              name='number'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acc. Number</FormLabel>
                  <FormControl>
                    <Input placeholder='Account number' {...field} />
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
                    <Input type='tel' placeholder='Phone number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fax */}
            <FormField
              control={form.control}
              name='fax_number'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fax</FormLabel>
                  <FormControl>
                    <Input placeholder='Fax Number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Password */}
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Password {mode === 'create' && <span className='text-red-500'>*</span>}</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder={mode === 'edit' ? 'Leave blank to keep current' : 'Enter password'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website */}
            <FormField
              control={form.control}
              name='website'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder='https://example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tax Type */}
            <FormField
              control={form.control}
              name='tax_type'
              rules={{ required: 'Tax type is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tax Type <span className='text-red-500'>*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select tax type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {taxTypes.map(taxType => (
                        <SelectItem key={taxType.id} value={taxType.slug}>
                          {taxType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Input type='email' placeholder='email@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Term */}
            <FormField
              control={form.control}
              name='payment_term_id'
              rules={{ required: 'Payment term is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Payment Term <span className='text-red-500'>*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select payment term' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentTerms.map(term => (
                        <SelectItem key={term.id} value={term.id}>
                          {term.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes - Full Width */}
            <div className='md:col-span-2'>
              <FormField
                control={form.control}
                name='note'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Enter notes' rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* B2B Section */}
          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='is_enable_b2b'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>Enable B2B</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {isB2BEnabled && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-7'>
                <FormField
                  control={form.control}
                  name='b2b_host_url'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>B2B Host URL</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter host URL' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='b2b_port_number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>B2B Port Number</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter port number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='b2b_vendor_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>B2B Vendor ID</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter vendor ID' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='b2b_username'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>B2B Username</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter username' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='b2b_password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>B2B Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder={mode === 'edit' ? 'Leave blank to keep current' : 'Enter password'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='profit_margin'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profit Margin (%)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          step={0.01}
                          placeholder='0.00'
                          {...field}
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Location Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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

            {/* Zip Code */}
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

            {/* Street Address - Full Width */}
            <div className='md:col-span-2'>
              <FormField
                control={form.control}
                name='street_address'
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

export default CreateOrEditVendorModal
