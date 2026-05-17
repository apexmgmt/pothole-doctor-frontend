'use client'

import { useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import AuthService from '@/services/api/auth.service'
import { CountryWithStates, ProfileDetailsPayload, User } from '@/types'
import { useAppDispatch } from '@/lib/hooks'
import { setUserData } from '@/lib/features/auth/authSlice'

interface UpdateProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userData: User
  countryWithStates?: CountryWithStates[]
}

interface FormValues {
  first_name: string
  last_name: string
  phone: string
  address: string
  street_address: string
  city_id: string
  state_id: string
  country_id: string
  zip_code: string
}

const UpdateProfileModal = ({ open, onOpenChange, userData, countryWithStates = [] }: UpdateProfileModalProps) => {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const isContractorOrReferral = ['contractor', 'referral'].includes((userData?.user_type || '').toLowerCase())

  const getDefaultValues = (): FormValues => ({
    first_name: userData?.first_name || '',
    last_name: userData?.last_name || '',
    phone: userData?.userable?.phone || '',
    address: userData?.userable?.address || '',
    street_address: userData?.userable?.street_address || '',
    city_id: userData?.userable?.city_id?.toString() || '',
    state_id: userData?.userable?.state_id?.toString() || '',
    country_id: userData?.userable?.city?.country_id?.toString() || '',
    zip_code: userData?.userable?.zip_code || ''
  })

  const form = useForm<FormValues>({
    defaultValues: getDefaultValues()
  })

  const selectedCountryId = form.watch('country_id')
  const selectedStateId = form.watch('state_id')

  const availableStates = useMemo(() => {
    if (!selectedCountryId) return []
    const country = countryWithStates.find(c => c.id.toString() === selectedCountryId)

    return country?.states || []
  }, [selectedCountryId, countryWithStates])

  const availableCities = useMemo(() => {
    if (!selectedStateId) return []
    const state = availableStates.find(s => s.id.toString() === selectedStateId)

    return state?.cities || []
  }, [selectedStateId, availableStates])

  useEffect(() => {
    if (selectedCountryId && form.getValues('state_id')) {
      const stateExists = availableStates.some(s => s.id.toString() === form.getValues('state_id'))

      if (!stateExists) {
        form.setValue('state_id', '')
        form.setValue('city_id', '')
      }
    }
  }, [selectedCountryId, availableStates, form])

  useEffect(() => {
    if (selectedStateId && form.getValues('city_id')) {
      const cityExists = availableCities.some(c => c.id.toString() === form.getValues('city_id'))

      if (!cityExists) {
        form.setValue('city_id', '')
      }
    }
  }, [selectedStateId, availableCities, form])

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues())
    }
  }, [open, userData, form])

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)

    const payload: ProfileDetailsPayload = {
      first_name: values.first_name,
      last_name: values.last_name,
      phone: values.phone
    }

    if (isContractorOrReferral) {
      payload.street_address = values.street_address
      payload.city_id = values.city_id
      payload.state_id = values.state_id
      payload.zip_code = values.zip_code
    } else {
      payload.address = values.address
    }

    try {
      await AuthService.updateProfileDetails(payload)

      // Update Redux state
      const updatedUser = {
        ...userData,
        first_name: values.first_name,
        last_name: values.last_name,
        name: `${values.first_name} ${values.last_name}`,
        userable: {
          ...userData.userable,
          phone: values.phone,
          address: isContractorOrReferral ? userData?.userable?.address : values.address,
          street_address: isContractorOrReferral ? values.street_address : userData?.userable?.street_address,
          city_id: isContractorOrReferral ? values.city_id : userData?.userable?.city_id,
          city: isContractorOrReferral
            ? countryWithStates
                .find(c => c.id.toString() === values.country_id)
                ?.states.find(s => s.id.toString() === values.state_id)
                ?.cities.find(c => c.id.toString() === values.city_id)
            : userData?.userable?.city,
          state_id: isContractorOrReferral ? values.state_id : userData?.userable?.state_id,
          state: isContractorOrReferral
            ? countryWithStates
                .find(c => c.id.toString() === values.country_id)
                ?.states.find(s => s.id.toString() === values.state_id)
            : userData?.userable?.state,
          zip_code: isContractorOrReferral ? values.zip_code : userData?.userable?.zip_code
        }
      } as User

      dispatch(setUserData(updatedUser))
      toast.success('Profile updated successfully')
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    form.reset(getDefaultValues())
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Updating profile...'
      open={open}
      onOpenChange={onOpenChange}
      title='Update Profile'
      description='Update your personal information'
      maxWidth='2xl'
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
            {form.formState.isSubmitting ? 'Saving...' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* First Name Field */}
            <FormField
              control={form.control}
              name='first_name'
              rules={{ required: 'First name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    First Name <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter first name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name Field */}
            <FormField
              control={form.control}
              name='last_name'
              rules={{ required: 'Last name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Last Name <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter last name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Email Field (Read Only) */}
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input value={userData?.email || ''} disabled className='bg-muted cursor-not-allowed' />
              </FormControl>
            </FormItem>

            {/* Phone Field */}
            <FormField
              control={form.control}
              name='phone'
              rules={{
                required: 'Phone is required',
                pattern: {
                  value: /^[0-9+\-\s()]+$/,
                  message: 'Invalid phone number'
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter phone number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isContractorOrReferral ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
                        {countryWithStates.map(country => (
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

              <div className='sm:col-span-2'>
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
              </div>
            </div>
          ) : (
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
                    <Input placeholder='Enter full address' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </form>
      </Form>
    </CommonDialog>
  )
}

export default UpdateProfileModal
