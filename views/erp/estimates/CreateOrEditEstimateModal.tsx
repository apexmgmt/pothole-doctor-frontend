'use client'

import { useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import {
  BusinessLocation,
  Client,
  Estimate,
  EstimatePayload,
  EstimateType,
  EstimateTypePayload,
  PaymentTerm,
  ServiceType,
  Staff
} from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import EstimateService from '@/services/api/estimates/estimates.service'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/datePicker'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import CustomFormField from '@/components/form/CustomFormField'

interface CreateOrEditEstimateModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  estimateId?: string
  estimateDetails?: Estimate
  onSuccess?: () => void
  serviceTypes: ServiceType[]
  estimateTypes: EstimateType[]
  clients: Client[]
  staffs: Staff[]
  paymentTerms: PaymentTerm[]
  businessLocations: BusinessLocation[]
  defaultClientId?: string
}

const CreateOrEditEstimateModal = ({
  mode = 'create',
  open,
  onOpenChange,
  estimateId,
  estimateDetails,
  onSuccess,
  serviceTypes,
  estimateTypes,
  clients,
  staffs,
  paymentTerms,
  businessLocations,
  defaultClientId
}: CreateOrEditEstimateModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<EstimatePayload>({
    defaultValues: {
      title: estimateDetails?.title || '',
      service_type_id: estimateDetails?.service_type_id || '',
      estimate_type_id: estimateDetails?.estimate_type_id || '',
      client_id: estimateDetails?.client_id || '',
      assign_id: estimateDetails?.assign_id || '',
      payment_term_id: estimateDetails?.payment_term_id || '',
      address_id: estimateDetails?.address_id || '',
      location_id: estimateDetails?.location_id || '',
      expiration_date: estimateDetails?.expiration_date || '',
      biding_date: estimateDetails?.biding_date || '',
      interaction: estimateDetails?.interaction || '',
      pickup_date: estimateDetails?.pickup_date || '',
      pickup_location_id: estimateDetails?.pickup_location_id || '',
      pickup_notes: estimateDetails?.pickup_notes || '',
      delivery_datetime: estimateDetails?.delivery_datetime || null,
      delivery_location: estimateDetails?.delivery_location || '',
      delivery_notes: estimateDetails?.delivery_notes || '',
      tax_rate: estimateDetails?.tax_rate || 0
    }
  })

  const {
    watch,
    setValue,
    register,
    control,
    formState: { errors }
  } = form

  // Reset form when estimateDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        title: estimateDetails?.title || '',
        service_type_id: estimateDetails?.service_type_id || '',
        estimate_type_id: estimateDetails?.estimate_type_id || '',
        client_id: estimateDetails?.client_id || defaultClientId || '',
        assign_id: estimateDetails?.assign_id || '',
        payment_term_id: estimateDetails?.payment_term_id || '',
        address_id: estimateDetails?.address_id || '',
        location_id: estimateDetails?.location_id || '',
        expiration_date: estimateDetails?.expiration_date || '',
        biding_date: estimateDetails?.biding_date || '',
        interaction: estimateDetails?.interaction || '',
        pickup_date: estimateDetails?.pickup_date || '',
        pickup_location_id: estimateDetails?.pickup_location_id || '',
        pickup_notes: estimateDetails?.pickup_notes || '',
        delivery_datetime: estimateDetails?.delivery_datetime || null,
        delivery_location: estimateDetails?.delivery_location || '',
        delivery_notes: estimateDetails?.delivery_notes || '',
        tax_rate: estimateDetails?.tax_rate || 0
      })
    }
  }, [estimateDetails, open, form])

  const onSubmit = async (values: EstimatePayload) => {
    const isMaterialOnlySubmit = estimateTypes.find(t => t.id === values.estimate_type_id)?.name === 'Material Only'

    const payload: EstimatePayload = {
      title: values.title,
      service_type_id: values.service_type_id,
      estimate_type_id: values.estimate_type_id,
      client_id: values.client_id,
      assign_id: values.assign_id,
      payment_term_id: values.payment_term_id,
      address_id: values.address_id,
      location_id: values.location_id,
      expiration_date: values.expiration_date,
      biding_date: values.biding_date,
      tax_rate: values.tax_rate,
      ...(isMaterialOnlySubmit && {
        interaction: values.interaction,
        ...(values.interaction === 'cash_and_pickup' && {
          pickup_date: values.pickup_date,
          pickup_location_id: values.pickup_location_id,
          pickup_notes: values.pickup_notes
        }),
        ...(values.interaction === 'cash_and_delivery' && {
          delivery_datetime: (() => {
            const raw = values.delivery_datetime

            if (!raw) return null
            const d = typeof raw === 'number' ? new Date(raw) : new Date((raw as string).replace(' ', 'T'))
            const pad = (n: number) => String(n).padStart(2, '0')

            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
          })(),
          delivery_location: values.delivery_location,
          delivery_notes: values.delivery_notes
        })
      })
    }

    if (mode === 'create') {
      try {
        await EstimateService.store(payload)
          .then(response => {
            toast.success('Estimate created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create estimate')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the estimate!')
      }
    } else if (mode === 'edit' && estimateId) {
      try {
        await EstimateService.update(estimateId, payload)
          .then(response => {
            toast.success('Estimate updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update estimate')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the estimate!')
      }
    }
  }

  const onCancel = () => {
    form.reset({
      title: estimateDetails?.title || '',
      service_type_id: estimateDetails?.service_type_id || '',
      estimate_type_id: estimateDetails?.estimate_type_id || '',
      client_id: estimateDetails?.client_id || '',
      assign_id: estimateDetails?.assign_id || '',
      payment_term_id: estimateDetails?.payment_term_id || '',
      address_id: estimateDetails?.address_id || '',
      location_id: estimateDetails?.location_id || '',
      expiration_date: estimateDetails?.expiration_date || '',
      biding_date: estimateDetails?.biding_date || '',
      interaction: estimateDetails?.interaction || '',
      pickup_date: estimateDetails?.pickup_date || '',
      pickup_location_id: estimateDetails?.pickup_location_id || '',
      pickup_notes: estimateDetails?.pickup_notes || '',
      delivery_datetime: estimateDetails?.delivery_datetime ?? null,
      delivery_location: estimateDetails?.delivery_location || '',
      delivery_notes: estimateDetails?.delivery_notes || '',
      tax_rate: estimateDetails?.tax_rate || 0
    })
    onOpenChange(false)
  }

  // Memoize addresses for selected client
  const selectedClient = useMemo(
    () => clients.find(c => c.id === form.watch('client_id')),
    [clients, form.watch('client_id')]
  )

  // Check if selected estimate type is "Material Only"
  const isMaterialOnly = useMemo(
    () => estimateTypes.find(t => t.id === form.watch('estimate_type_id'))?.name === 'Material Only',
    [estimateTypes, form.watch('estimate_type_id')]
  )

  const interactionValue = form.watch('interaction')

  const addressOptions = selectedClient?.addresses || []

  // Find default address ID and auto-set when client changes
  const defaultAddressId = addressOptions.find(addr => addr.is_default === 1)?.id ?? ''

  // When client changes, auto-select default address and client's business location
  useEffect(() => {
    form.setValue('address_id', defaultAddressId)

    if (mode === 'create') {
      form.setValue('location_id', selectedClient?.location_id ?? '')
    }
  }, [form.watch('client_id'), mode, selectedClient, defaultAddressId])

  // Auto-populate tax_rate from selected business location's sales_tax if tax_rate is empty
  useEffect(() => {
    const selectedLocation = businessLocations.find(loc => loc.id === form.watch('location_id'))
    const currentTaxRate = form.watch('tax_rate')

    if (selectedLocation && selectedLocation.sales_tax) {
      form.setValue('tax_rate', selectedLocation.sales_tax)
    }
  }, [form.watch('location_id'), businessLocations])

  console.log(watch())

  const fieldStyle = 'grid grid-cols-[152px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  return (
    <CommonDialog
      isLoading={form.formState.isSubmitting}
      loadingMessage='Loading estimate...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Estimate' : 'Edit Estimate'}
      description={mode === 'create' ? 'Add a new estimate to the system' : 'Update estimate information'}
      className='sm:max-w-264!'
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
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2'>
          {/* Estimate Title Field */}
          <CustomFormField
            name='title'
            label='Title'
            placeholder='Enter estimate title'
            rules={{
              required: 'Estimate title is required',
              minLength: { value: 2, message: 'Estimate title must be at least 2 characters' }
            }}
            register={register}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Estimate type field */}
          <CustomFormField
            name='estimate_type_id'
            label='Estimate Type'
            type='select'
            placeholder='Select estimate type'
            rules={{
              required: 'Estimate type is required'
            }}
            selectOptions={estimateTypes.map(type => ({
              label: type.name,
              value: type.id
            }))}
            register={register}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Client field */}
          <CustomFormField
            name='client_id'
            label='Customer'
            type='combobox'
            placeholder='Select customer'
            rules={{
              required: 'Customer is required'
            }}
            selectOptions={clients.map(client => ({
              label: `${client.first_name} ${client.last_name}`,
              value: client.id
            }))}
            onChange={() => {
              form.setValue('address_id', '')

              if (mode === 'create') {
                form.setValue('location_id', '')
              }
            }}
            register={register}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Material Only: Interaction field */}
          {isMaterialOnly && (
            <FormField
              control={form.control}
              name='interaction'
              rules={{ required: 'Interaction type is required' }}
              render={({ field }) => (
                <FormItem className={`sm:col-span-2 py-3 ${fieldStyle}`}>
                  <FormLabel className={`text-xs ${labelStyle}`}>
                    Interaction <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={value => {
                        field.onChange(value)

                        // Reset sub-fields when switching
                        form.setValue('pickup_date', '')
                        form.setValue('pickup_location_id', '')
                        form.setValue('pickup_notes', '')
                        form.setValue('delivery_datetime', null)
                        form.setValue('delivery_location', '')
                        form.setValue('delivery_notes', '')
                      }}
                      className='flex flex-row gap-6'
                    >
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='cash_and_pickup' id='cash_and_pickup' />
                        <label htmlFor='cash_and_pickup' className='text-sm font-medium leading-none cursor-pointer'>
                          Cash and Pickup
                        </label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='cash_and_delivery' id='cash_and_delivery' />
                        <label htmlFor='cash_and_delivery' className='text-sm font-medium leading-none cursor-pointer'>
                          Cash and Delivery
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Cash and Pickup sub-fields */}
          {isMaterialOnly && interactionValue === 'cash_and_pickup' && (
            <>
              <CustomFormField
                name='pickup_date'
                label='Date of Pickup'
                type='datepicker'
                placeholder='Select pickup date'
                rules={{ required: 'Date of pickup is required' }}
                register={register}
                control={control}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />

              <CustomFormField
                name='pickup_location_id'
                label='Pickup Location'
                type='select'
                placeholder='Select Pickup Location'
                rules={{ required: 'Pickup location is required' }}
                selectOptions={businessLocations.map(loc => ({
                  label: loc.name,
                  value: loc.id
                }))}
                register={register}
                control={control}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />

              <CustomFormField
                name='pickup_notes'
                label='Notes'
                type='textarea'
                placeholder='Enter notes...'
                register={register}
                control={control}
                errors={errors}
                fieldClassName={`sm:col-span-2 ${fieldStyle}`}
                labelClassName={labelStyle}
              />
            </>
          )}

          {/* Cash and Delivery sub-fields */}
          {isMaterialOnly && interactionValue === 'cash_and_delivery' && (
            <>
              <FormField
                control={form.control}
                name='delivery_datetime'
                rules={{ required: 'Date & time of delivery is required' }}
                render={({ field }) => (
                  <FormItem className={fieldStyle}>
                    <FormLabel className={`text-xs ${labelStyle}`}>
                      Date &amp; Time of Delivery <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={
                          typeof field.value === 'number'
                            ? field.value
                            : field.value
                              ? new Date((field.value as string).replace(' ', 'T')).getTime()
                              : null
                        }
                        onChange={val => {
                          if (val === null) {
                            field.onChange(null)
                          } else {
                            const d = new Date(val)
                            const pad = (n: number) => String(n).padStart(2, '0')

                            const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

                            field.onChange(formatted)
                          }
                        }}
                        placeholder='Select delivery date & time'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CustomFormField
                name='delivery_location'
                label='Delivery Location'
                placeholder='Enter delivery location'
                rules={{ required: 'Delivery location is required' }}
                register={register}
                control={control}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />

              <CustomFormField
                name='delivery_notes'
                label='Notes'
                type='textarea'
                placeholder='Enter notes...'
                register={register}
                control={control}
                errors={errors}
                fieldClassName={`sm:col-span-2 ${fieldStyle}`}
                labelClassName={labelStyle}
              />
            </>
          )}

          {/* Location field (address select) */}
          {/* Business Location */}
          <CustomFormField
            name='location_id'
            label='Business Location'
            type='select'
            placeholder='Select Business Location'
            selectOptions={businessLocations.map(loc => ({ value: loc.id, label: loc.name }))}
            register={register}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Event Location (Client Address) */}
          <CustomFormField
            name='address_id'
            label='Event Location'
            type='select'
            placeholder={selectedClient ? 'Select Address' : 'Select Customer first'}
            selectOptions={addressOptions.map(address => {
              const label = [address.street_address, address.city?.name, address.state?.name, address.zip_code]
                .filter(Boolean)
                .join(', ')

              return { value: address.id, label: `${address.title} - ${label}` }
            })}
            register={register}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Assigned Estimator field */}
          <CustomFormField
            name='assign_id'
            label='Assigned Estimator'
            type='combobox'
            placeholder='Select Assigned Estimator'
            rules={{
              required: 'Assigned estimator is required'
            }}
            selectOptions={staffs.map(staff => ({
              value: staff.id,
              label: `${staff.first_name} ${staff.last_name}`
            }))}
            register={register}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Payment terms field */}
          <CustomFormField
            name='payment_term_id'
            label='Payment Term'
            type='select'
            placeholder='Select Payment Term'
            rules={{
              required: 'Payment term is required'
            }}
            selectOptions={paymentTerms.map(term => ({
              value: term.id,
              label: term.name
            }))}
            register={register}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Expiry Date field */}
          <CustomFormField
            name='expiration_date'
            label='Expiration Date'
            type='datepicker'
            placeholder='Select expiration date'
            register={register}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Bidding Date field */}
          <CustomFormField
            name='biding_date'
            label='Bidding Date'
            type='datepicker'
            placeholder='Select bidding date'
            rules={{
              required: 'Bidding date is required'
            }}
            register={register}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Tax Rate field */}
          <CustomFormField
            name='tax_rate'
            label='Tax Rate (%)'
            type='number'
            placeholder='Enter tax rate'
            register={register}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditEstimateModal
