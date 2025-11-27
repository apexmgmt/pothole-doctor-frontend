'use client'

import { CreateOrEditPartnerModalProps, PartnerPayload } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useEffect, useMemo, useState } from 'react'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import PartnerService from '@/services/api/partners/partners.service'

import { Separator } from '@/components/ui/separator'
import { LocationFields } from './LocationFields'
import { HoldAmountFields } from './HoldAmountFields'
import { ContractorDetailsFields } from './ContractorDetailsFields'
import { EntityInformationFields } from './EntityInformationFields'
import { BasicInformationFields } from './BasicInformationFields'
import { formatDateTime } from '@/utils/date'

const formSchema = z.object({
  first_name: z.string().min(2, { message: 'Partner name must be at least 2 characters' }),
  last_name: z.string().optional(),
  company_name: z.string().optional(),
  email: z.email({ message: 'Invalid email address' }),
  phone: z.string().min(7, { message: 'Phone number must be at least 7 characters' }),
  status: z.boolean(),
  entity: z.string(),
  ssn: z.string().optional(),
  ein: z.string().optional(),
  fax: z.string().optional(),
  notes: z.string().optional(),
  schedule_color: z.string().optional(),
  skills: z.array(z.string()).optional(),
  insurance_expiration: z.union([z.string(), z.number(), z.date(), z.null()]).optional().nullable(),
  w9_expiration: z.union([z.string(), z.number(), z.date(), z.null()]).optional().nullable(),
  hold_amount: z.coerce.number().min(0),
  hold_amount_percent: z.coerce.number().min(0).max(100),
  street_address: z.union([z.string(), z.number()]),
  zip_code: z.union([z.string(), z.number()]),
  in_house_contractor: z.coerce.number().optional(),
  is_email_confirmation: z.coerce.number().optional(),
  role: z.string(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  city_id: z.string(),
  state_id: z.string(),
  country_id: z.string(),
  location_id: z.array(z.string()).optional(),
  partner_type_id: z.string()
})

type FormValues = z.infer<typeof formSchema>

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
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: partnerDetails?.user?.first_name || '',
      last_name: partnerDetails?.user?.last_name || '',
      email: partnerDetails?.user?.email || '',
      phone: partnerDetails?.phone || '',
      company_name: partnerDetails?.company?.name || '',
      status: partnerDetails?.user ? (partnerDetails?.user?.status ? true : false) : true,
      entity: partnerDetails?.entity || 'individual',
      ssn: partnerDetails?.ssn || '',
      ein: partnerDetails?.ein || '',
      fax: partnerDetails?.fax || '',
      notes: partnerDetails?.notes || '',
      schedule_color: partnerDetails?.schedule_color || '',
      skills: partnerDetails?.skills ? partnerDetails?.skills.map(skill => skill.name) : [],
      insurance_expiration: partnerDetails?.insurance_expiration ? new Date(partnerDetails?.insurance_expiration) : '',
      w9_expiration: partnerDetails?.w9_expiration ? new Date(partnerDetails?.w9_expiration) : '',
      hold_amount: partnerDetails?.hold_amount || 0,
      hold_amount_percent: partnerDetails?.hold_amount_percent || 0,
      street_address: partnerDetails?.street_address || '',
      zip_code: partnerDetails?.zip_code || '',
      in_house_contractor: partnerDetails?.in_house_contractor || 0,
      is_email_confirmation: partnerDetails?.is_email_confirmation || 0,
      role: partnerDetails?.user?.role || 'Contractor',
      password: '',
      city_id: partnerDetails?.city_id || '',
      state_id: partnerDetails?.state_id || '',
      country_id: partnerDetails?.city ? partnerDetails?.city?.country_id : '',
      location_id: partnerDetails?.locations ? partnerDetails?.locations.map(location => location.id.toString()) : [],
      partner_type_id: partnerDetails?.partner_type_id || ''
    }
  })

  // Reset form when partnerDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        first_name: partnerDetails?.user?.first_name || '',
        last_name: partnerDetails?.user?.last_name || '',
        email: partnerDetails?.user?.email || '',
        phone: partnerDetails?.phone || '',
        company_name: partnerDetails?.company?.name || '',
        status: partnerDetails?.user ? (partnerDetails?.user?.status ? true : false) : true,
        entity: partnerDetails?.entity || 'individual',
        ssn: partnerDetails?.ssn || '',
        ein: partnerDetails?.ein || '',
        fax: partnerDetails?.fax || '',
        notes: partnerDetails?.notes || '',
        schedule_color: partnerDetails?.schedule_color || '',
        skills: partnerDetails?.skills ? partnerDetails?.skills.map(skill => skill.name) : [],
        insurance_expiration: partnerDetails?.insurance_expiration
          ? new Date(partnerDetails?.insurance_expiration)
          : '',
        w9_expiration: partnerDetails?.w9_expiration ? new Date(partnerDetails?.w9_expiration) : '',
        hold_amount: partnerDetails?.hold_amount || 0,
        hold_amount_percent: partnerDetails?.hold_amount_percent || 0,
        street_address: partnerDetails?.street_address || '',
        zip_code: partnerDetails?.zip_code || '',
        in_house_contractor: partnerDetails?.in_house_contractor || 0,
        is_email_confirmation: partnerDetails?.is_email_confirmation || 0,
        role: partnerDetails?.user?.role || 'Contractor',
        password: '',
        city_id: partnerDetails?.city_id?.toString() || '',
        state_id: partnerDetails?.state_id?.toString() || '',
        country_id: partnerDetails?.city ? partnerDetails?.city?.country_id?.toString() : '',
        location_id: partnerDetails?.locations ? partnerDetails?.locations.map(location => location.id.toString()) : [],
        partner_type_id: partnerDetails?.partner_type_id || ''
      })
    }
  }, [partnerDetails, open, form, mode])

  const onSubmit = async (values: FormValues) => {
    const payload: PartnerPayload = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone,
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
      role: values.role,
      password: values.password,
      city_id: values.city_id,
      state_id: values.state_id,
      // country_id: values.country_id,
      location_id: values.location_id || [],
      partner_type_id: values.partner_type_id
    }

    setIsLoading(true)

    if (mode === 'create') {
      try {
        await PartnerService.store(payload)
          .then(response => {
            toast.success('Contractor created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
            setIsLoading(false)
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create contractor')
            setIsLoading(false)
          })
      } catch (error) {
        toast.error('Something went wrong while creating the contractor!')
        setIsLoading(false)
      }
    } else if (mode === 'edit' && partnerId) {
      try {
        await PartnerService.update(partnerId, payload)
          .then(response => {
            toast.success('Contractor updated successfully')
            onOpenChange(false)
            onSuccess?.()
            setIsLoading(false)
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update contractor')
            setIsLoading(false)
          })
      } catch (error) {
        toast.error('Something went wrong while updating the contractor!')
        setIsLoading(false)
      }
    }
  }

  const onCancel = () => {
    form.reset({
      first_name: partnerDetails?.user?.first_name || '',
      last_name: partnerDetails?.user?.last_name || '',
      email: partnerDetails?.user?.email || '',
      phone: partnerDetails?.phone || '',
      company_name: partnerDetails?.company?.name || '',
      status: partnerDetails?.user ? (partnerDetails?.user?.status ? true : false) : true,
      entity: partnerDetails?.entity || 'individual',
      ssn: partnerDetails?.ssn || '',
      ein: partnerDetails?.ein || '',
      fax: partnerDetails?.fax || '',
      notes: partnerDetails?.notes || '',
      schedule_color: partnerDetails?.schedule_color || '',
      skills: partnerDetails?.skills ? partnerDetails?.skills.map(skill => skill.name) : [],
      insurance_expiration: partnerDetails?.insurance_expiration ? new Date(partnerDetails?.insurance_expiration) : '',
      w9_expiration: partnerDetails?.w9_expiration ? new Date(partnerDetails?.w9_expiration) : '',
      hold_amount: partnerDetails?.hold_amount || 0,
      hold_amount_percent: partnerDetails?.hold_amount_percent || 0,
      zip_code: partnerDetails?.zip_code || '',
      in_house_contractor: partnerDetails?.in_house_contractor || 0,
      is_email_confirmation: partnerDetails?.is_email_confirmation || 0,
      role: partnerDetails?.user?.role || 'Contractor',
      password: '',
      city_id: partnerDetails?.city_id || '',
      state_id: partnerDetails?.state_id || '',
      country_id: partnerDetails?.city ? partnerDetails?.city?.country_id : '',
      location_id: partnerDetails?.locations ? partnerDetails?.locations.map(location => location.id) : [],
      partner_type_id: partnerDetails?.partner_type_id || ''
    })
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

  const role = form.watch('role')

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

            {/* Entity Information section - now using the separated component */}
            <EntityInformationFields form={form} />

            {role === 'Contractor' && (
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
