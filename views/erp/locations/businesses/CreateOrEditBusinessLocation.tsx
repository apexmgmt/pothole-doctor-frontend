'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import LocationService from '@/services/api/locations/location.service'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { Location, BusinessLocationPayload } from '@/types'
import { Separator } from '@/components/ui/separator'

const formSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  fax: z.string(),
  is_branding: z.boolean(),
  logo: z.any().nullable(),
  website: z.string(),
  invoice_prefix: z.string().min(1, 'Invoice prefix is required'),
  sales_tax: z.string(),
  review_link: z.string(),
  country_id: z.string().min(1, 'Country is required'),
  state_id: z.string().min(1, 'State is required'),
  city_id: z.string().min(1, 'City is required'),
  street_address: z.string().min(1, 'Street address is required'),
  zip_code: z.string().min(1, 'ZIP code is required')
})

type FormData = z.infer<typeof formSchema>

const CreateOrEditBusinessLocation = ({
  countriesWithStateAndCities
}: {
  countriesWithStateAndCities: Location['countries']
}) => {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [countriesData, setCountriesData] = useState<Location['countries']>(countriesWithStateAndCities || [])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      fax: '',
      is_branding: false,
      logo: null,
      website: '',
      invoice_prefix: '',
      sales_tax: '',
      review_link: '',
      country_id: '',
      state_id: '',
      city_id: '',
      street_address: '',
      zip_code: ''
    }
  })

  // Watch country_id and state_id to filter states and cities
  const selectedCountryId = form.watch('country_id')
  const selectedStateId = form.watch('state_id')

  // Get states based on selected country
  const availableStates = useMemo(() => {
    if (!selectedCountryId) return []
    const selectedCountry = countriesData.find(country => country.id.toString() === selectedCountryId)
    return selectedCountry?.states || []
  }, [selectedCountryId, countriesData])

  // Get cities based on selected state
  const availableCities = useMemo(() => {
    if (!selectedStateId) return []
    const selectedState = availableStates.find(state => state.id.toString() === selectedStateId)
    return selectedState?.cities || []
  }, [selectedStateId, availableStates])

  // Reset state_id when country changes
  useEffect(() => {
    if (selectedCountryId && !isEditMode) {
      const currentStateId = form.getValues('state_id')
      const isStateInCountry = availableStates.some(state => state.id.toString() === currentStateId)

      if (!isStateInCountry) {
        form.setValue('state_id', '')
        form.setValue('city_id', '')
      }
    }
  }, [selectedCountryId, availableStates, form, isEditMode])

  // Reset city_id when state changes
  useEffect(() => {
    if (selectedStateId && !isEditMode) {
      const currentCityId = form.getValues('city_id')
      const isCityInState = availableCities.some(city => city.id.toString() === currentCityId)

      if (!isCityInState) {
        form.setValue('city_id', '')
      }
    }
  }, [selectedStateId, availableCities, form, isEditMode])

  // Fetch countries with states and cities
  const fetchCountriesWithStateAndCities = async () => {
    try {
      setIsLoading(true)
      const response = await LocationService.index()
      setCountriesData(response.data || [])
      setIsLoading(false)
    } catch (error) {
      toast.error('Failed to fetch locations')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const locationId = params?.id as string

    // Fetch countries data if not provided
    if (!countriesWithStateAndCities || countriesWithStateAndCities.length === 0) {
      fetchCountriesWithStateAndCities()
    }

    if (locationId) {
      setIsEditMode(true)
      dispatch(setPageTitle('Edit Business Location'))
      fetchBusinessLocation(locationId)
    } else {
      dispatch(setPageTitle('Add New Business Location'))
      setIsEditMode(false)
    }
  }, [params])

  const fetchBusinessLocation = async (id: string) => {
    try {
      const response = await BusinessLocationService.show(id)
      const data = response.data

      form.reset({
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        fax: data.fax || '',
        is_branding: data.is_branding === 1 || data.is_branding === true,
        website: data.website || '',
        invoice_prefix: data.invoice_prefix || '',
        sales_tax: data.sales_tax?.toString() || '',
        review_link: data.review_link || '',
        country_id: data.city?.state?.country?.id?.toString() || '',
        state_id: data.city?.state?.id?.toString() || data.state_id || '',
        city_id: data.city?.id?.toString() || data.city_id || '',
        street_address: data.street_address || '',
        zip_code: data.zip_code || ''
      })

      // Set logo preview if exists
      if (data.logo) {
        setLogoPreview(data.logo)
      }

      // After setting form values, allow dropdowns to work normally
      setTimeout(() => setIsEditMode(false), 100)
    } catch (error) {
      toast.error('Failed to fetch business location details')
      console.error(error)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue('logo', file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      // Create payload object
      const payload: any = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        is_branding: data.is_branding ? 1 : 0,
        invoice_prefix: data.invoice_prefix,
        street_address: data.street_address,
        city_id: data.city_id,
        state_id: data.state_id,
        zip_code: data.zip_code
      }

      // Add optional fields only if they have values
      if (data.fax) payload.fax = data.fax
      if (data.website) payload.website = data.website
      if (data.review_link) payload.review_link = data.review_link

      // Add sales_tax if present
      if (data.sales_tax) {
        const salesTaxNumber = parseFloat(data.sales_tax)
        if (!isNaN(salesTaxNumber)) {
          payload.sales_tax = salesTaxNumber
        }
      }

      // Add logo if it's a File
      if (data.logo && data.logo instanceof File) {
        payload.logo = data.logo
      }

      if (params?.id) {
        await BusinessLocationService.update(params.id as string, payload)
        toast.success('Business location updated successfully')
      } else {
        await BusinessLocationService.store(payload)
        toast.success('Business location created successfully')
      }

      router.push('/locations/businesses')
    } catch (error: any) {
      toast.error(error?.message || 'Something went wrong')
      console.error(error)
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/erp/locations/businesses')
  }

  return (
    <div className=''>
      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle className='text-2xl font-semibold'>
            {params?.id ? 'Edit Business Location' : 'Add New Location'}
          </CardTitle>
        </CardHeader>
        <CardContent className='max-w-[1024px]'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Location Name */}
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter location name' {...field} />
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
                        <Input placeholder='Enter phone number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type='email' placeholder='Enter email address' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fax */}
                <FormField
                  control={form.control}
                  name='fax'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fax</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter fax' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Location Specific Branding Switch */}
                <FormField
                  control={form.control}
                  name='is_branding'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>Location Specific Branding</FormLabel>
                        <FormDescription>Enable custom branding for this location</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
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
                        <Input placeholder='Enter website URL' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Logo Upload */}
                <FormField
                  control={form.control}
                  name='logo'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo</FormLabel>
                      <FormControl>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-4'>
                            <Input
                              type='file'
                              accept='image/*'
                              onChange={handleLogoChange}
                              className='cursor-pointer'
                            />
                          </div>
                          {logoPreview && (
                            <div className='mt-2'>
                              <img
                                src={logoPreview}
                                alt='Logo preview'
                                className='h-20 w-20 object-contain rounded border'
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator />
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Invoice Prefix */}
                <FormField
                  control={form.control}
                  name='invoice_prefix'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Prefix</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter invoice prefix' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sales Tax */}
                <FormField
                  control={form.control}
                  name='sales_tax'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sales Tax</FormLabel>
                      <FormControl>
                        <Input type='number' step='0.01' placeholder='Enter sales tax' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Review Link */}
                <FormField
                  control={form.control}
                  name='review_link'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Link</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter review link' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator />
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Country Select Field */}
                <FormField
                  control={form.control}
                  name='country_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select a country' />
                          </SelectTrigger>
                        </FormControl>
                        {countriesData.length > 0 && (
                          <SelectContent>
                            {countriesData.map(country => (
                              <SelectItem key={country.id} value={country.id.toString()}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        )}
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* State Select Field */}
                <FormField
                  control={form.control}
                  name='state_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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

                {/* City Select Field */}
                <FormField
                  control={form.control}
                  name='city_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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

                {/* Street Address */}
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

                {/* ZIP Code */}
                <FormField
                  control={form.control}
                  name='zip_code'
                  render={({ field }) => {
                    const [zipMain, zipExt] = field.value?.split('-') || ['', '']

                    return (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <div className='flex gap-2 items-center'>
                            <Input
                              placeholder='12345'
                              className='flex-1'
                              maxLength={5}
                              value={zipMain || ''} // Add || '' to ensure it's never undefined
                              onChange={e => {
                                const newValue = e.target.value
                                const newZip = zipExt ? `${newValue}-${zipExt}` : newValue
                                field.onChange(newZip)
                              }}
                            />
                            <span className='text-muted-foreground'>-</span>
                            <Input
                              placeholder='0000'
                              className='w-24'
                              maxLength={4}
                              value={zipExt || ''} // Add || '' to ensure it's never undefined
                              onChange={e => {
                                const newValue = e.target.value
                                const newZip = zipMain ? `${zipMain}-${newValue}` : `-${newValue}`
                                field.onChange(newZip)
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className='flex gap-4 pt-4'>
                <Button type='submit' disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
                <Button type='button' variant='outline' onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateOrEditBusinessLocation
