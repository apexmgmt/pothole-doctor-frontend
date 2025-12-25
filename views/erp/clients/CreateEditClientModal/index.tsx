'use client'

import React, { useEffect } from 'react'

import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'

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
import BasicClientReferenceFields from './BasicClientReferenceFields'
import { Separator } from '@/components/ui/separator'
import BasicClientFields from './BasicClientFields'
import AddressFields from './AddressFileds'

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

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting }
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
        city_id: clientData?.address?.city_id || '',
        state_id: clientData?.address?.state_id || '',
        country_id: clientData?.address?.city?.country_id || '',
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

  const onSubmit = async (data: ClientPayload) => {
    try {
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

      const payload = { ...rest }

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
          })
          .catch(error => {
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
          })
          .catch(error => {
            toast.error(`Failed to update ${type === 'lead' ? 'lead' : 'customer'}`)
          })
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save lead')
    }
  }

  const dialogActions = (
    <>
      <Button type='button' variant='outline' onClick={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button type='submit' form='client-form' disabled={isSubmitting}>
        {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
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
      isLoading={isSubmitting}
      loadingMessage={
        mode === 'create'
          ? `Creating ${type === 'lead' ? 'Lead' : 'Customer'}...`
          : `Updating ${type === 'lead' ? 'Lead' : 'Customer'}...`
      }
      actions={dialogActions}
      disableClose={isSubmitting}
    >
      <form id='client-form' onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <BasicClientReferenceFields
          type={type}
          methods={methods}
          clientSources={clientSources}
          staffs={staffs}
          businessLocations={businessLocations}
          contactTypes={contactTypes}
        />
        <Separator />
        <BasicClientFields
          type={type}
          methods={methods}
          companies={companies}
          interestLevels={interestLevels}
          serviceTypes={serviceTypes}
        />
        <Separator />
        <AddressFields methods={methods} countriesWithStatesAndCities={countriesWithStatesAndCities} />
      </form>
    </CommonDialog>
  )
}

export default CreateEditClientModal
