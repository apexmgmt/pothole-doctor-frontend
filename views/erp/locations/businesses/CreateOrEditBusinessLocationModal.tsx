'use client'

import React, { useState, useEffect, useMemo } from 'react'

import { Controller, Path, RegisterOptions, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { Location, BusinessLocation } from '@/types'
import { Separator } from '@/components/ui/separator'
import { generateFileUrl } from '@/utils/utility'
import { InputType, SelectOption } from '@/components/form/fields/types'
import CustomFormField from '@/components/form/CustomFormField'
import { FieldError } from '@/components/ui/field'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'

interface FormData {
  name: string
  phone: string
  email: string
  fax: string
  is_branding: boolean
  logo: File | null
  website: string
  invoice_prefix: string
  sales_tax: string
  review_link: string
  country_id: string
  state_id: string
  city_id: string
  street_address: string
  zip_code: string
}

type FormField = {
  name: Path<FormData>
  type: InputType
  label: string
  disabled?: boolean
  placeholder?: string
  rules?: RegisterOptions<FormData, Path<FormData>>
  selectOptions?: SelectOption[]
  onChange?: (value: any) => void
}

const CreateOrEditBusinessLocationModal = ({
  mode = 'create',
  open,
  onOpenChange,
  onSuccess,
  isFetching = false,
  businessLocationId = null,
  businessLocationDetails = null,
  countriesWithStateAndCities
}: {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  isFetching?: boolean
  businessLocationId?: string | null
  businessLocationDetails?: BusinessLocation | null
  countriesWithStateAndCities: Location['countries']
}) => {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const defaultValues: FormData = useMemo(
    () => ({
      name: businessLocationDetails?.name || '',
      phone: businessLocationDetails?.phone || '',
      email: businessLocationDetails?.email || '',
      fax: businessLocationDetails?.fax || '',
      is_branding: businessLocationDetails?.is_branding === 1,
      logo: null,
      website: businessLocationDetails?.website || '',
      invoice_prefix: businessLocationDetails?.invoice_prefix || '',
      sales_tax: businessLocationDetails?.sales_tax?.toString() || '0',
      review_link: businessLocationDetails?.review_link || '',
      country_id: businessLocationDetails?.city?.country_id?.toString() || '',
      state_id: businessLocationDetails?.state_id?.toString() || '',
      city_id: businessLocationDetails?.city_id?.toString() || '',
      street_address: businessLocationDetails?.street_address || '',
      zip_code: businessLocationDetails?.zip_code || ''
    }),
    [businessLocationDetails]
  )

  const form = useForm<FormData>({ defaultValues })

  const {
    watch,
    getValues,
    setValue,
    setError,
    control,
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = form

  useEffect(() => {
    if (open) {
      form.reset(defaultValues)
    }
  }, [open, defaultValues, isFetching])

  const selectedCountryId = watch('country_id')
  const selectedStateId = watch('state_id')
  const isBranding = watch('is_branding')

  const availableStates = useMemo(() => {
    if (!selectedCountryId) return []
    const selectedCountry = countriesWithStateAndCities.find(country => country.id.toString() === selectedCountryId)

    return selectedCountry?.states || []
  }, [selectedCountryId, countriesWithStateAndCities])

  const availableCities = useMemo(() => {
    if (!selectedStateId) return []
    const selectedState = availableStates.find(state => state.id.toString() === selectedStateId)

    return selectedState?.cities || []
  }, [selectedStateId, availableStates])

  useEffect(() => {
    dispatch(setPageTitle(mode === 'edit' ? 'Edit Business Location' : 'Add New Business Location'))

    if (businessLocationDetails?.logo) {
      setLogoPreview(generateFileUrl(businessLocationDetails.logo))
    } else {
      setLogoPreview(null)
    }
  }, [mode, businessLocationDetails, dispatch])

  useEffect(() => {
    if (selectedCountryId && mode === 'create') {
      const currentStateId = getValues('state_id')
      const isStateInCountry = availableStates.some(state => state.id.toString() === currentStateId)

      if (!isStateInCountry) {
        setValue('state_id', '')
        setValue('city_id', '')
      }
    }
  }, [selectedCountryId, availableStates, mode])

  useEffect(() => {
    if (selectedStateId && mode === 'create') {
      const currentCityId = getValues('city_id')
      const isCityInState = availableCities.some(city => city.id.toString() === currentCityId)

      if (!isCityInState) {
        setValue('city_id', '')
      }
    }
  }, [selectedStateId, availableCities, mode])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file) {
      setValue('logo', file)

      const reader = new FileReader()

      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }

  const logoInputRef = React.useRef<HTMLInputElement>(null)

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const formData = new FormData()

      formData.append('name', data.name)
      formData.append('email', data.email)
      formData.append('phone', data.phone)
      formData.append('is_branding', data.is_branding ? '1' : '0')
      formData.append('invoice_prefix', data.invoice_prefix)
      formData.append('street_address', data.street_address)
      formData.append('city_id', data.city_id)
      formData.append('state_id', data.state_id)
      formData.append('zip_code', data.zip_code)

      if (data.fax) formData.append('fax', data.fax)

      if (data.is_branding && data.website) {
        const websiteUrl = data.website.startsWith('http') ? data.website : `https://${data.website}`

        formData.append('website', websiteUrl)
      }

      if (data.review_link) {
        const reviewLinkUrl = data.review_link.startsWith('http') ? data.review_link : `https://${data.review_link}`

        formData.append('review_link', reviewLinkUrl)
      }

      if (data.sales_tax) {
        const salesTaxNumber = parseFloat(data.sales_tax)

        if (!isNaN(salesTaxNumber)) {
          formData.append('sales_tax', salesTaxNumber.toString())
        }
      }

      if (data.is_branding && data.logo && data.logo instanceof File) {
        formData.append('logo', data.logo)
      }

      if (mode === 'edit' && businessLocationId) {
        await BusinessLocationService.update(businessLocationId, formData)
        toast.success('Business location updated successfully')
        onSuccess?.()
      } else {
        await BusinessLocationService.store(formData)
        toast.success('Business location created successfully')
        onSuccess?.()
      }
    } catch (error: any) {
      if (error?.errors && typeof error.errors === 'object') {
        Object.entries(error.errors).forEach(([fieldName, errMsg]: [string, any]) => {
          if (errMsg && Array.isArray(errMsg) && errMsg.length > 0) {
            setError(fieldName as any, {
              type: 'manual',
              message: errMsg[0]
            })
          }
        })
      } else {
        toast.error(error?.message || 'Something went wrong')
      }

      setIsLoading(false)
    }
  }

  const onCancel = () => {
    form.reset()

    onOpenChange(false)
  }

  const locationInfoFields: FormField[] = [
    {
      name: 'name',
      type: 'text',
      label: 'Location Name',
      placeholder: 'Enter location name',
      rules: { required: 'Location name is required' }
    },
    {
      name: 'phone',
      type: 'tel',
      label: 'Phone',
      placeholder: 'Enter phone number',
      rules: { required: 'Phone number is required' }
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'Enter email address',
      rules: {
        required: 'Email address is required'
      }
    },
    {
      name: 'fax',
      type: 'text',
      label: 'Fax',
      placeholder: 'Enter fax'
    }
  ]

  const businessFields: FormField[] = [
    {
      name: 'invoice_prefix',
      type: 'text',
      label: 'Invoice Prefix',
      placeholder: 'Enter invoice prefix',
      rules: { required: 'Invoice prefix is required' }
    },
    {
      name: 'sales_tax',
      type: 'number',
      label: 'Sales Tax',
      placeholder: 'Enter sales tax'
    },
    {
      name: 'review_link',
      type: 'text',
      label: 'Review Link',
      placeholder: 'Enter review link',
      rules: {
        pattern: {
          value: /^(https?:\/\/)?.+\..+/,
          message: 'Invalid review link URL'
        }
      }
    }
  ]

  const locationFields: FormField[] = [
    {
      name: 'country_id',
      type: 'combobox',
      label: 'Country',
      placeholder: 'Select a country',
      rules: { required: 'Country is required' },
      selectOptions: countriesWithStateAndCities.map(country => ({
        label: country.name,
        value: country.id.toString()
      })),
      onChange: () => {
        setValue('state_id', '')
        setValue('city_id', '')
      }
    },
    {
      name: 'state_id',
      type: 'combobox',
      label: 'State',
      disabled: !selectedCountryId || availableStates.length === 0,
      placeholder: 'Select a state',
      rules: { required: 'State is required' },
      selectOptions: availableStates.map(state => ({
        label: state.name,
        value: state.id.toString()
      })),
      onChange: () => {
        setValue('city_id', '')
      }
    },
    {
      name: 'city_id',
      type: 'combobox',
      label: 'City',
      disabled: !selectedStateId || availableCities.length === 0,
      placeholder: 'Select a city',
      rules: { required: 'City is required' },
      selectOptions: availableCities.map(city => ({
        label: city.name,
        value: city.id.toString()
      }))
    },
    {
      name: 'street_address',
      type: 'text',
      label: 'Street Address',
      placeholder: 'Enter street address',
      rules: { required: 'Street address is required' }
    }
  ]

  const groupStyle = 'grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2'
  const fieldStyle = 'grid grid-cols-[100px_minmax(100px,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  const renderFormField = (field: FormField) => {
    const isHorizontalField = field.type === 'switch' || field.type === 'checkbox'

    return (
      <CustomFormField
        key={field.name}
        {...field}
        control={control}
        register={register}
        errors={errors}
        fieldClassName={isHorizontalField ? '' : fieldStyle}
        labelClassName={isHorizontalField ? '' : labelStyle}
      />
    )
  }

  return (
    <CommonDialog
      isLoading={isFetching || isLoading}
      loadingMessage='Loading location...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'edit' ? 'Edit Business Location' : 'Add New Location'}
      disableClose={isSubmitting}
      className='sm:max-w-252!'
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type='submit' onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {/* Location Information Fields */}
          <div className={groupStyle}>{locationInfoFields.map(field => renderFormField(field))}</div>

          <Separator />

          {/* Location Specific Branding Switch */}
          <div>
            <div className='ps-27'>
              {renderFormField({
                name: 'is_branding',
                type: 'switch',
                label: 'Location Specific Branding'
              })}
            </div>

            {isBranding && (
              <div className={`pt-4 ${groupStyle}`}>
                {/* Website — only when branding is on */}
                {renderFormField({
                  name: 'website',
                  type: 'text',
                  label: 'Website',
                  placeholder: 'Enter website URL',
                  rules: {
                    pattern: { value: /^(https?:\/\/)?.+\..+/, message: 'Invalid website URL' }
                  }
                })}

                {/* Logo Upload — only when branding is on */}
                <FormField
                  control={control}
                  name='logo'
                  render={() => (
                    <FormItem className={fieldStyle}>
                      <FormLabel className={`text-xs ${labelStyle}`}>Logo</FormLabel>
                      <FormControl>
                        <div className='space-y-2'>
                          <input
                            ref={logoInputRef}
                            type='file'
                            accept='image/*'
                            onChange={handleLogoChange}
                            className='hidden'
                          />
                          {logoPreview ? (
                            <div
                              className='cursor-pointer group relative h-20 w-20'
                              onClick={() => logoInputRef.current?.click()}
                              title='Click to change logo'
                            >
                              <img
                                src={logoPreview}
                                alt='Logo preview'
                                className='h-20 w-20 object-contain rounded group-hover:opacity-70 transition-opacity'
                              />
                              <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                                <span className='text-xs text-foreground bg-background/80 rounded px-1 py-0.5'>
                                  Change
                                </span>
                              </div>
                            </div>
                          ) : (
                            <Input
                              type='file'
                              accept='image/*'
                              onChange={handleLogoChange}
                              className='cursor-pointer text-white file:text-primary file:border-2 file:px-2 file:rounded-xl'
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <Separator />

          <div className={groupStyle}>{businessFields.map(field => renderFormField(field))}</div>

          <Separator />

          <div className={groupStyle}>
            {locationFields.map(field => renderFormField(field))}

            {/* ZIP Code */}
            <Controller
              name='zip_code'
              control={control}
              rules={{ required: 'ZIP code is required' }}
              render={({ field }) => {
                const [zipMain, zipExt] = field.value?.split('-') || ['', '']

                return (
                  <div className={`gap-2 ${fieldStyle}`}>
                    <FormLabel className={`text-xs ${labelStyle}`}>
                      ZIP Code <span className='text-red-500'>*</span>
                    </FormLabel>

                    <div>
                      <div className='flex gap-2 items-center'>
                        <CustomFormField
                          placeholder='12345'
                          value={zipMain || ''}
                          onChange={value => {
                            if ((value as string).length > 5) return

                            const newValue = (value as string).replace(/\D/g, '')
                            const newZip = zipExt ? `${newValue}-${zipExt}` : newValue

                            field.onChange(newZip)
                          }}
                          fieldClassName='flex-1'
                        />
                        <span className='text-muted-foreground'>-</span>
                        <CustomFormField
                          placeholder='0000'
                          value={zipExt || ''}
                          onChange={value => {
                            if ((value as string).length > 4) return

                            const newValue = (value as string).replace(/\D/g, '')
                            const newZip = zipMain ? `${zipMain}-${newValue}` : `-${newValue}`

                            field.onChange(newZip)
                          }}
                          fieldClassName='w-24'
                        />
                      </div>

                      {errors?.zip_code && (
                        <FieldError className='mt-1'>{String(errors.zip_code.message) ?? ''}</FieldError>
                      )}
                    </div>
                  </div>
                )
              }}
            />
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditBusinessLocationModal
