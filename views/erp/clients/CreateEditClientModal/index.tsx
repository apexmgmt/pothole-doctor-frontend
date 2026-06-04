'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Path, RegisterOptions, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  BusinessLocation,
  Client,
  ClientSource,
  Company,
  ContactType,
  InterestLevel,
  ClientPayload,
  ServiceType,
  Staff,
  CountryWithStates,
  ClientAddressPayload
} from '@/types'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import ClientService from '@/services/api/clients/clients.service'
import ClientAddressService from '@/services/api/clients/client-addresses.service'
import { Separator } from '@/components/ui/separator'
import { InputType, SelectOption } from '@/components/form/fields/types'
import CustomFormField from '@/components/form/CustomFormField'
import GooglePlaceField from '@/components/form/fields/GooglePlaceField'

type FormField = {
  name: Path<ClientPayload>
  type: InputType | 'google-place'
  label: string
  placeholder?: string
  rules?: RegisterOptions<ClientPayload, Path<ClientPayload>>
  selectOptions?: SelectOption[]
}

interface CreateEditClientModalProps {
  type: 'lead' | 'customer'
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  clientId?: string | null
  clientData?: Client | null
  onSuccess: () => void
  interestLevels: InterestLevel[]
  companies: Company[]
  staffs: Staff[]
  clientSources: ClientSource[]
  serviceTypes: ServiceType[]
  businessLocations: BusinessLocation[]
  contactTypes: ContactType[]
  countriesWithStatesAndCities: CountryWithStates[]
}

const CreateEditClientModal: React.FC<CreateEditClientModalProps> = ({
  type,
  isOpen,
  onClose,
  mode,
  clientId,
  clientData,
  onSuccess,
  interestLevels,
  companies,
  staffs,
  clientSources,
  serviceTypes,
  businessLocations,
  contactTypes,
  countriesWithStatesAndCities
}) => {
  const methods = useForm<ClientPayload>({
    defaultValues: {
      type: type,
      spouse_name: '',
      address: '',
      address_id: '',
      address_title: '',
      address_is_default: 1,
      city_id: '',
      state_id: '',
      country_id: '',
      zip_code: '',
      best_time: '',
      spouse_phone: '',
      cell_phone: '',
      cc_email: '',
      pre_qualified_amount: 0,
      is_tax_exempt: 0,
      is_quick_book: 0,
      company_name: '',
      interest_level_id: '',
      reference_id: '',
      first_name: '',
      last_name: '',
      display_name: '',
      phone: '',
      email: '',
      source_id: '',
      lead_cost: 0,
      status: 1,
      location_id: '',
      service_type_ids: [],
      contact_type_id: ''
    }
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const {
    reset,
    watch,
    setValue,
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = methods

  // Populate form data when editing
  useEffect(() => {
    if (mode === 'edit' && clientData && isOpen) {
      reset({
        type: type,
        spouse_name: clientData?.clientable?.spouse_name || '',
        address: clientData?.address?.street_address || '',
        address_id: clientData?.address?.id || '',
        address_title: clientData?.address?.title || '',
        address_is_default: clientData?.address?.is_default || 0,
        city_id: clientData?.address?.city_id?.toString() || '',
        state_id: clientData?.address?.state_id?.toString() || '',
        country_id: clientData?.address?.city?.country_id?.toString() || '',
        zip_code: clientData?.address?.zip_code || '',
        best_time: clientData?.clientable?.best_time || '',
        spouse_phone: clientData?.clientable?.spouse_phone || '',
        cell_phone: clientData?.clientable?.cell_phone || '',
        cc_email: clientData?.clientable?.cc_email || '',
        pre_qualified_amount: Number(clientData?.clientable?.pre_qualified_amount) || 0,
        is_tax_exempt: clientData?.clientable?.is_tax_exempt || 0,
        is_quick_book: clientData?.clientable?.is_quick_book || 0,
        company_name: clientData?.company?.name || '',
        interest_level_id: clientData?.interest_level_id || '',
        reference_id: clientData?.reference_id || '',
        first_name: clientData?.first_name || '',
        last_name: clientData?.last_name || '',
        display_name: clientData?.display_name || '',
        phone: clientData?.phone || '',
        email: clientData?.email || '',
        source_id: clientData?.source_id || '',
        lead_cost: Number(clientData?.lead_cost) || 0,
        status: clientData?.status || 1,
        location_id: clientData?.location_id || '',
        contact_type_id: clientData?.contact_type_id || '',
        service_type_ids: clientData?.desired_services?.map(service => service.id) || []
      })
    } else if (mode === 'create' && isOpen) {
      reset({
        type: type,
        spouse_name: '',
        address: '',
        address_id: '',
        address_title: '',
        address_is_default: 1,
        city_id: '',
        state_id: '',
        country_id: '',
        zip_code: '',
        best_time: '',
        spouse_phone: '',
        cell_phone: '',
        cc_email: '',
        pre_qualified_amount: 0,
        is_tax_exempt: 0,
        is_quick_book: 0,
        company_name: '',
        interest_level_id: '',
        reference_id: '',
        first_name: '',
        last_name: '',
        display_name: '',
        phone: '',
        email: '',
        source_id: '',
        lead_cost: 0,
        status: 1,
        location_id: '',
        contact_type_id: '',
        service_type_ids: []
      })
    }
  }, [mode, clientData, isOpen, reset])

  const onSubmit = async (formData: ClientPayload) => {
    try {
      setIsLoading(true)

      // Remove address_search from data as it's only used for GooglePlaceField and not needed in payload
      const { address_search, ...data } = formData

      // separate address, state_id, city_id and zip_code from data
      const {
        address,
        address_id,
        address_title,
        address_is_default,
        country_id,
        state_id,
        city_id,
        zip_code,
        ...rest
      } = data

      const payload = {
        ...rest,
        cc_email:
          rest.cc_email
            ?.split(/[,\s]+/)
            .map(email => email.trim())
            .filter(Boolean)
            .join(',') || ''
      }

      const addressPayload: ClientAddressPayload = {
        client_id: clientId || '',
        title: address_title || 'Primary Address',
        street_address: address || '',
        state_id: state_id || '',
        city_id: city_id || '',
        zip_code: zip_code || '',
        is_default: address_is_default || 1
      }

      if (mode === 'create') {
        ClientService.store(payload)
          .then(response => {
            const createdClientId = response.data.id

            // Now create the client address
            // if address has the value street_address, state_id, city_id, title
            if (address_title && address && state_id && city_id) {
              ClientAddressService.store({ ...addressPayload, client_id: createdClientId })
            }

            toast.success(`${type === 'lead' ? 'Lead' : 'Customer'} created successfully`)
            onSuccess()
            onClose()
            reset()
            setIsLoading(false)
          })
          .catch(error => {
            setIsLoading(false)
            toast.error(`Failed to create ${type === 'lead' ? 'lead' : 'customer'}`)
          })
      } else if (mode === 'edit' && clientId) {
        ClientService.update(clientId, payload)
          .then(response => {
            // Update or create the client address
            if (address_id) {
              ClientAddressService.update(address_id, addressPayload)
            } else {
              if (address_title && address && state_id && city_id) {
                ClientAddressService.store({ ...addressPayload, client_id: clientId })
              }
            }

            toast.success(`${type === 'lead' ? 'Lead' : 'Customer'} updated successfully`)
            onSuccess()
            onClose()
            reset()
            setIsLoading(false)
          })
          .catch(error => {
            toast.error(`Failed to update ${type === 'lead' ? 'lead' : 'customer'}`)
            setIsLoading(false)
          })
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save lead')
      setIsLoading(false)
    }
  }

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
    if (selectedCountryId) {
      const stateExists = availableStates.some(s => s.id.toString() === watch('state_id'))

      if (!stateExists) {
        setValue('state_id', '')
        setValue('city_id', '')
      }
    }
  }, [selectedCountryId, availableStates, setValue, watch])

  // Reset city when state changes
  useEffect(() => {
    if (selectedStateId) {
      const cityExists = availableCities.some(c => c.id.toString() === watch('city_id'))

      if (!cityExists) {
        setValue('city_id', '')
      }
    }
  }, [selectedStateId, availableCities, setValue, watch])

  // Basic client reference fields
  const basicClientReferenceFields: FormField[] = [
    {
      name: 'location_id',
      type: 'select',
      label: 'Location',
      placeholder: 'Select location',
      rules: { required: 'Location is required' },
      selectOptions: businessLocations.map(location => ({
        value: location.id,
        label: location.name
      }))
    },
    {
      name: 'reference_id',
      type: 'select',
      label: 'Sales Rep',
      placeholder: 'Select sales rep',
      rules: { required: 'Sales Representative is required' },
      selectOptions: staffs
        ? staffs.map(staff => ({
            value: staff.id,
            label: `${staff.first_name} ${staff.last_name}`
          }))
        : []
    },
    {
      name: 'source_id',
      type: 'combobox',
      label: 'Lead Source',
      placeholder: 'Select lead source',
      rules: { required: 'Lead Source is required' },
      selectOptions: clientSources.map(source => ({
        value: source.id,
        label: source.name
      }))
    },
    {
      name: 'contact_type_id',
      type: 'select',
      label: 'Contact Type',
      placeholder: 'Select contact type',
      rules: { required: 'Contact Type is required' },
      selectOptions: contactTypes.map(type => ({
        value: type.id,
        label: type.name
      }))
    }
  ]

  // Basic client info fields
  const basicClientFields: FormField[] = [
    {
      name: 'first_name',
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter first name',
      rules: {
        required: 'First Name is required'
      }
    },
    {
      name: 'last_name',
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter last name',
      rules: {
        required: 'Last Name is required'
      }
    },
    {
      name: 'company_name',
      type: 'select-creatable',
      label: 'Company Name',
      placeholder: 'Select or create company',
      selectOptions: companies.map(company => ({
        value: company.name,
        label: company.name
      }))
    },
    {
      name: 'display_name',
      type: 'text',
      label: 'Display Name',
      placeholder: 'Enter display name'
    },
    {
      name: 'interest_level_id',
      type: 'select',
      label: 'Interest Level',
      placeholder: 'Select interest level',
      rules: {
        required: 'Interest Level is required'
      },
      selectOptions: interestLevels.map(level => ({
        value: level.id,
        label: level.name
      }))
    },
    {
      name: 'lead_cost',
      type: 'number',
      label: 'Lead Cost',
      placeholder: 'Enter lead cost'
    },
    {
      name: 'phone',
      type: 'tel',
      label: 'Main Phone',
      placeholder: '10 digit phone number',
      rules: {
        required: 'Main Phone is required'
      }
    },
    {
      name: 'cell_phone',
      type: 'tel',
      label: 'Cell Phone',
      placeholder: '10 digit phone number'
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'Enter email',
      rules: {
        required: 'Email is required',
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Invalid email address'
        }
      }
    },
    {
      name: 'spouse_name',
      type: 'text',
      label: 'Spouse Name',
      placeholder: 'Enter spouse name'
    },
    {
      name: 'cc_email',
      type: 'text',
      label: 'CC Email',
      placeholder: 'Enter cc email',
      rules: {
        pattern: {
          value: /^([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})([\s,]+[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})*$/i,
          message: 'Invalid email address list'
        }
      }
    },
    {
      name: 'spouse_phone',
      type: 'tel',
      label: 'Spouse Phone',
      placeholder: '10 digit phone number'
    },
    {
      name: 'best_time',
      type: 'text',
      label: 'Best Time to Reach',
      placeholder: 'Enter best time'
    },
    {
      name: 'service_type_ids',
      type: 'multiselect-searchable',
      label: 'Desired Service(s)',
      placeholder: 'Select service types...',
      selectOptions: serviceTypes.map(service => ({
        value: service.id,
        label: service.name
      }))
    },
    {
      name: 'pre_qualified_amount',
      type: 'number',
      label: 'Pre-qualified Financing Amount',
      placeholder: 'Enter amount'
    },
    {
      name: 'is_tax_exempt',
      type: 'checkbox',
      label: 'Tax Exempt'
    }
  ]

  // Address fields
  const addressFields: FormField[] = [
    {
      name: 'address_title',
      type: 'text',
      label: 'Address Title',
      placeholder: 'e.g. Home, Office',
      rules: { required: 'Address Title is required' }
    },
    {
      name: 'address_search',
      type: 'google-place',
      label: 'Search Location',
      placeholder: 'Search for an address...'
    },
    {
      name: 'country_id',
      type: 'select',
      label: 'Country',
      placeholder: 'Select a country',
      rules: {
        required: 'Country is required'
      },
      selectOptions: countriesWithStatesAndCities.map(country => ({
        value: country.id.toString(),
        label: country.name
      }))
    },
    {
      name: 'state_id',
      type: 'select',
      label: 'State',
      placeholder: 'Select a state',
      rules: {
        required: 'State is required'
      },
      selectOptions: availableStates.map(state => ({
        value: state.id.toString(),
        label: state.name
      }))
    },
    {
      name: 'city_id',
      type: 'select',
      label: 'City',
      placeholder: 'Select a city',
      rules: {
        required: 'City is required'
      },
      selectOptions: availableCities.map(city => ({
        value: city.id.toString(),
        label: city.name
      }))
    },
    {
      name: 'zip_code',
      type: 'text',
      label: 'Zip Code',
      placeholder: 'Enter zip code'
    },
    {
      name: 'address',
      type: 'text',
      label: 'Street Address',
      placeholder: 'Enter address'
    }
  ]

  const dialogActions = (
    <>
      <Button type='button' variant='outline' onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button type='submit' form='client-form' disabled={isLoading}>
        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        {mode === 'create'
          ? `Create ${type === 'lead' ? 'Lead' : 'Customer'}`
          : `Update ${type === 'lead' ? 'Lead' : 'Customer'}`}
      </Button>
    </>
  )

  return (
    <CommonDialog
      open={isOpen}
      onOpenChange={onClose}
      title={
        mode === 'create'
          ? `Create New ${type === 'lead' ? 'Lead' : 'Customer'}`
          : `Edit ${type === 'lead' ? 'Lead' : 'Customer'}`
      }
      maxWidth='5xl'
      isLoading={isLoading}
      loadingMessage={
        mode === 'create'
          ? `Creating ${type === 'lead' ? 'Lead' : 'Customer'}...`
          : `Updating ${type === 'lead' ? 'Lead' : 'Customer'}...`
      }
      actions={dialogActions}
      disableClose={true}
      className='sm:max-w-252!'
    >
      <form id='client-form' onSubmit={handleSubmit(onSubmit)} className='space-y-3'>
        {[basicClientReferenceFields, basicClientFields, addressFields].map((fieldGroup, index) => (
          <React.Fragment key={index}>
            {index !== 0 && <Separator />}

            <div className='grid grid-cols-1 md:grid-cols-2 items-start gap-x-9 gap-y-2'>
              {fieldGroup.map(({ name, type, label, placeholder, rules, selectOptions }) => {
                if (type === 'google-place') {
                  return (
                    <GooglePlaceField
                      key={name}
                      name={name}
                      label={label}
                      placeholder={placeholder}
                      rules={rules}
                      control={control}
                      errors={errors}
                      onPlaceSelect={data => {
                        const { city, state, country, postalCode } = data

                        // Set zip code
                        if (postalCode) {
                          setValue('zip_code', postalCode)
                        }

                        // Match country
                        if (country) {
                          const matchedCountry = countriesWithStatesAndCities.find(
                            item => item.name.toLowerCase() === country.toLowerCase()
                          )

                          if (matchedCountry) {
                            setValue('country_id', matchedCountry.id.toString())

                            // Match state
                            if (state) {
                              const matchedState = matchedCountry.states.find(
                                item => item.name.toLowerCase() === state.toLowerCase()
                              )

                              if (matchedState) {
                                setValue('state_id', matchedState.id.toString())

                                // Match city
                                if (city) {
                                  const matchedCity = matchedState.cities.find(
                                    item => item.name.toLowerCase() === city.toLowerCase()
                                  )

                                  if (matchedCity) {
                                    setValue('city_id', matchedCity.id.toString())
                                  }
                                }
                              }
                            }
                          }
                        }
                      }}
                      fieldClassName='grid grid-cols-[128px_minmax(0,_1fr)]'
                      labelClassName='justify-end self-start text-right pt-px'
                    />
                  )
                }

                return (
                  <CustomFormField
                    key={name}
                    name={name}
                    type={type}
                    label={label}
                    placeholder={placeholder}
                    selectOptions={selectOptions}
                    rules={rules}
                    register={register}
                    control={control}
                    errors={errors}
                    fieldClassName={
                      type === 'checkbox' ? 'ps-34 mt-3 md:mt-6' : 'grid grid-cols-[128px_minmax(0,_1fr)]'
                    }
                    labelClassName={type === 'checkbox' ? 'text-nowrap' : 'justify-end self-start text-right pt-px'}
                  />
                )
              })}
            </div>
          </React.Fragment>
        ))}
      </form>
    </CommonDialog>
  )
}

export default CreateEditClientModal
