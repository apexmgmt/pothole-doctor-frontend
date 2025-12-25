'use client'

import { useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { CreateOrEditPartnerModalProps, PartnerPayload } from '@/types'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import PartnerService from '@/services/api/partners/partners.service'

import { Separator } from '@/components/ui/separator'
import { LocationFields } from './LocationFields'
import { HoldAmountFields } from './HoldAmountFields'
import { ContractorDetailsFields } from './ContractorDetailsFields'
import { EntityInformationFields } from './EntityInformationFields'
import { BasicInformationFields } from './BasicInformationFields'
import { formatDateTime } from '@/utils/date'

interface FormValues {
  first_name: string
  last_name?: string
  company_name?: string
  email: string
  phone?: string
  status: boolean
  entity: string
  ssn?: string
  ein?: string
  fax?: string
  notes?: string
  schedule_color?: string
  skills?: string[]
  insurance_expiration?: string | number | Date | null
  w9_expiration?: string | number | Date | null
  hold_amount: number
  hold_amount_percent: number
  street_address: string | number
  zip_code: string | number
  in_house_contractor?: number
  is_email_confirmation?: number
  user_type: string
  password?: string
  city_id: string
  state_id: string
  country_id: string
  location_id?: string[]
  partner_type_id: string
}

const CreateOrEditPartnerModal = ({
  mode = 'create',
  open,
  onOpenChange,
  partnerId,
  partnerDetails,
  onSuccess,
  businessLocations,
  partnerTypes,
  countriesWithStatesAndCities,
  companies,
  skills
}: CreateOrEditPartnerModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    defaultValues: {
      first_name: partnerDetails?.first_name ?? '',
      last_name: partnerDetails?.last_name ?? '',
      email: partnerDetails?.email ?? '',
      phone: partnerDetails?.userable?.phone ?? '',
      company_name: partnerDetails?.userable?.company?.name ?? '',
      status: partnerDetails ? !!partnerDetails.status : true,
      entity: partnerDetails?.userable?.entity ?? 'individual',
      ssn: partnerDetails?.userable?.ssn ?? '',
      ein: partnerDetails?.userable?.ein ?? '',
      fax: partnerDetails?.userable?.fax ?? '',
      notes: partnerDetails?.userable?.notes ?? '',
      schedule_color: partnerDetails?.userable?.schedule_color ?? '',
      skills: partnerDetails?.userable?.skills ? partnerDetails.userable.skills.map(skill => skill.name) : [],
      insurance_expiration: partnerDetails?.userable?.insurance_expiration
        ? new Date(partnerDetails.userable.insurance_expiration)
        : null,
      w9_expiration: partnerDetails?.userable?.w9_expiration ? new Date(partnerDetails.userable.w9_expiration) : null,
      hold_amount: partnerDetails?.userable?.hold_amount ?? 0,
      hold_amount_percent: partnerDetails?.userable?.hold_amount_percent ?? 0,
      street_address: partnerDetails?.userable?.street_address ?? '',
      zip_code: partnerDetails?.userable?.zip_code ?? '',
      in_house_contractor: partnerDetails?.userable?.in_house_contractor ?? 0,
      is_email_confirmation: partnerDetails?.userable?.is_email_confirmation ?? 0,
      user_type: partnerDetails?.user_type ?? 'contractor',
      password: '',
      city_id: partnerDetails?.userable?.city_id?.toString() ?? '',
      state_id: partnerDetails?.userable?.state_id?.toString() ?? '',
      country_id: partnerDetails?.userable?.city ? partnerDetails.userable.city.country_id?.toString() : '',
      location_id: partnerDetails?.userable?.locations
        ? partnerDetails.userable.locations.map(location => location.id.toString())
        : [],
      partner_type_id: partnerDetails?.userable?.partner_type_id ?? ''
    }
  })

  // Reset form when partnerDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        first_name: partnerDetails?.first_name || '',
        last_name: partnerDetails?.last_name || '',
        email: partnerDetails?.email || '',
        phone: partnerDetails?.userable?.phone || '',
        company_name: partnerDetails?.userable?.company?.name || '',
        status: partnerDetails ? (partnerDetails?.status ? true : false) : true,
        entity: partnerDetails?.userable?.entity || 'individual',
        ssn: partnerDetails?.userable?.ssn || '',
        ein: partnerDetails?.userable?.ein || '',
        fax: partnerDetails?.userable?.fax || '',
        notes: partnerDetails?.userable?.notes || '',
        schedule_color: partnerDetails?.userable?.schedule_color || '',
        skills: partnerDetails?.userable?.skills ? partnerDetails.userable.skills.map(skill => skill.name) : [],
        insurance_expiration: partnerDetails?.userable?.insurance_expiration
          ? new Date(partnerDetails.userable.insurance_expiration)
          : null,
        w9_expiration: partnerDetails?.userable?.w9_expiration ? new Date(partnerDetails.userable.w9_expiration) : null,
        hold_amount: partnerDetails?.userable?.hold_amount || 0,
        hold_amount_percent: partnerDetails?.userable?.hold_amount_percent || 0,
        street_address: partnerDetails?.userable?.street_address || '',
        zip_code: partnerDetails?.userable?.zip_code || '',
        in_house_contractor: partnerDetails?.userable?.in_house_contractor || 0,
        is_email_confirmation: partnerDetails?.userable?.is_email_confirmation || 0,
        user_type: partnerDetails?.user_type || 'contractor',
        password: '',
        city_id: partnerDetails?.userable?.city_id?.toString() || '',
        state_id: partnerDetails?.userable?.state_id?.toString() || '',
        country_id: partnerDetails?.userable?.city ? partnerDetails.userable.city.country_id?.toString() : '',
        location_id: partnerDetails?.userable?.locations
          ? partnerDetails.userable.locations.map(location => location.id.toString())
          : [],
        partner_type_id: partnerDetails?.userable?.partner_type_id || ''
      })
    }
  }, [partnerDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    const payload: PartnerPayload = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone || '',
      company_name: values.company_name,
      status: values.status ? 1 : 0,
      entity: values.entity,
      ssn: values.ssn || '',
      ein: values.ein || '',
      fax: values.fax || '',
      notes: values.notes || '',
      schedule_color: values.schedule_color || '',
      skills: values.skills || [],
      insurance_expiration: formatDateTime(values.insurance_expiration ?? null),
      w9_expiration: formatDateTime(values.w9_expiration ?? null),
      hold_amount: values.hold_amount,
      hold_amount_percent: values.hold_amount_percent,
      street_address: values.street_address || '',
      zip_code: values.zip_code || '',
      in_house_contractor: values.in_house_contractor || 0,
      is_email_confirmation: values.is_email_confirmation || 0,
      user_type: values.user_type,
      password: values.password || '',
      city_id: values.city_id,
      state_id: values.state_id,
      location_id: values.location_id || [],
      partner_type_id: values.partner_type_id
    }

    setIsLoading(true)

    try {
      if (mode === 'create') {
        await PartnerService.store(payload)
        toast.success('Contractor created successfully')
        form.reset()
        onOpenChange(false)
        onSuccess?.()
      } else if (mode === 'edit' && partnerId) {
        await PartnerService.update(partnerId, payload)
        toast.success('Contractor updated successfully')
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      toast.error(typeof error?.message === 'string' ? error.message : 'Failed to save contractor')
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  // Watch country and state selection
  const selectedCountryId = form.watch('country_id')
  const selectedStateId = form.watch('state_id')

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

  const user_type = form.watch('user_type')

  // Clear contractor-specific fields when user_type changes to referral
  useEffect(() => {
    if (user_type === 'referral') {
      form.setValue('partner_type_id', '')
      form.setValue('skills', [])
      form.setValue('schedule_color', '')
      form.setValue('in_house_contractor', 0)
      form.setValue('insurance_expiration', null)
      form.setValue('w9_expiration', null)
    }
  }, [user_type, form])

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading contractor...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Contractor' : 'Edit Contractor'}
      description={mode === 'create' ? 'Add a new contractor to the system' : 'Update contractor information'}
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
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mb-4'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            <BasicInformationFields form={form} businessLocations={businessLocations} companies={companies} />

            {/* Entity Information section */}
            <EntityInformationFields form={form} />

            {user_type === 'contractor' && (
              <div className='col-span-3'>
                <Separator />
              </div>
            )}
            {/* Contractor Details section */}
            <ContractorDetailsFields form={form} skills={skills} partnerTypes={partnerTypes} />
            <div className='col-span-3'>
              <Separator />
            </div>
            {/* Hold Amount section */}
            <HoldAmountFields form={form} />
            <div className='col-span-3'>
              <Separator />
            </div>
            {/* Location section */}
            <LocationFields form={form} countriesWithStatesAndCities={countriesWithStatesAndCities} />
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditPartnerModal
