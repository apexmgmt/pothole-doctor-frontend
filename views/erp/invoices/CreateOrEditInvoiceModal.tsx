'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  BusinessLocation,
  Client,
  EstimateType,
  Invoice,
  InvoicePayload,
  PaymentTerm,
  ServiceType,
  Staff
} from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import InvoiceService from '@/services/api/invoices/invoices.service'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import CustomFormField from '@/components/form/CustomFormField'

interface CreateOrEditInvoiceModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId?: string
  invoiceDetails?: Invoice
  onSuccess?: () => void
  onCreateSuccess?: (invoice: Invoice) => void
  invoiceTypes: EstimateType[]
  serviceTypes: ServiceType[]
  clients: Client[]
  staffs: Staff[]
  paymentTerms: PaymentTerm[]
  businessLocations: BusinessLocation[]
  defaultClientId?: string
}

const CreateOrEditInvoiceModal = ({
  mode = 'create',
  open,
  onOpenChange,
  invoiceId,
  invoiceDetails,
  onSuccess,
  onCreateSuccess,
  invoiceTypes,
  serviceTypes,
  clients,
  staffs,
  paymentTerms,
  businessLocations,
  defaultClientId
}: CreateOrEditInvoiceModalProps) => {
  const form = useForm<InvoicePayload>({
    defaultValues: {
      title: '',
      service_type_id: '',
      invoice_type_id: '',
      client_id: '',
      assign_id: '',
      payment_term_id: '',
      address_id: '',
      location_id: '',
      due_date: '',
      issue_date: '',
      interaction: '',
      pickup_date: '',
      pickup_location_id: '',
      pickup_notes: '',
      delivery_datetime: null,
      delivery_location: '',
      delivery_notes: '',
      tax_rate: 0
    }
  })

  const {
    control,
    register,
    formState: { errors }
  } = form

  useEffect(() => {
    if (open) {
      form.reset({
        title: invoiceDetails?.title || '',
        service_type_id: invoiceDetails?.service_type_id || '',
        invoice_type_id: invoiceDetails?.invoice_type_id || '',
        client_id: invoiceDetails?.client_id || defaultClientId || '',
        assign_id: invoiceDetails?.assign_id || '',
        payment_term_id: invoiceDetails?.payment_term_id || '',
        address_id: invoiceDetails?.address_id || '',
        location_id: invoiceDetails?.location_id || '',
        due_date: invoiceDetails?.due_date || '',
        issue_date: invoiceDetails?.issue_date || '',
        interaction:
          (invoiceDetails?.interaction as '' | 'cash_and_pickup' | 'cash_and_delivery' | null | undefined) || '',
        pickup_date: invoiceDetails?.pickup_date || '',
        pickup_location_id: invoiceDetails?.pickup_location_id || '',
        pickup_notes: invoiceDetails?.pickup_notes || '',
        delivery_datetime: invoiceDetails?.delivery_datetime || null,
        delivery_location: invoiceDetails?.delivery_location || '',
        delivery_notes: invoiceDetails?.delivery_notes || '',
        tax_rate: invoiceDetails?.tax_rate || 0
      })
    }
  }, [invoiceDetails, open])

  const onSubmit = async (values: InvoicePayload) => {
    const isMaterialOnly = invoiceTypes.find(t => t.id === values.invoice_type_id)?.name === 'Material Only'

    const payload: InvoicePayload = {
      title: values.title,
      service_type_id: values.service_type_id,
      invoice_type_id: values.invoice_type_id,
      client_id: values.client_id,
      assign_id: values.assign_id,
      payment_term_id: values.payment_term_id,
      address_id: values.address_id,
      location_id: values.location_id,
      due_date: values.due_date,
      issue_date: values.issue_date,
      tax_rate: values.tax_rate,
      ...(isMaterialOnly && {
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
        const response = await InvoiceService.store(payload)

        toast.success('Invoice created successfully')
        form.reset()
        onOpenChange(false)

        if (onCreateSuccess && response?.data) {
          onCreateSuccess(response.data)
        } else {
          onSuccess?.()
        }
      } catch (error: any) {
        toast.error(typeof error.message === 'string' ? error.message : 'Failed to create invoice')
      }
    } else if (mode === 'edit' && invoiceId) {
      try {
        await InvoiceService.update(invoiceId, payload)
        toast.success('Invoice updated successfully')
        form.reset()
        onOpenChange(false)
        onSuccess?.()
      } catch (error: any) {
        toast.error(typeof error.message === 'string' ? error.message : 'Failed to update invoice')
      }
    }
  }

  const onCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  const selectedClient = useMemo(
    () => clients.find(c => c.id === form.watch('client_id')),
    [clients, form.watch('client_id')]
  )

  const isMaterialOnly = useMemo(
    () => invoiceTypes.find(t => t.id === form.watch('invoice_type_id'))?.name === 'Material Only',
    [invoiceTypes, form.watch('invoice_type_id')]
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
  }, [form.watch('client_id')])

  // Auto-populate tax_rate from selected business location's sales_tax if tax_rate is empty
  useEffect(() => {
    const selectedLocation = businessLocations.find(loc => loc.id === form.watch('location_id'))
    const currentTaxRate = form.watch('tax_rate')

    if (selectedLocation && selectedLocation.sales_tax && currentTaxRate === 0) {
      form.setValue('tax_rate', selectedLocation.sales_tax)
    }
  }, [form.watch('location_id'), businessLocations])

  const fieldStyle = 'grid grid-cols-[152px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  return (
    <CommonDialog
      isLoading={form.formState.isSubmitting}
      loadingMessage='Saving invoice...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Invoice' : 'Edit Invoice'}
      description={mode === 'create' ? 'Add a new invoice to the system' : 'Update invoice information'}
      className='max-w-264!'
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
            {form.formState.isSubmitting
              ? 'Saving...'
              : mode === 'create'
                ? 'Create & Add Services '
                : 'Update & Edit Services →'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2'>
          {/* Title */}
          <CustomFormField
            name='title'
            label='Title'
            placeholder='Enter invoice title'
            rules={{
              required: 'Invoice title is required',
              minLength: { value: 2, message: 'Min 2 characters' }
            }}
            register={register}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Invoice Type */}
          <CustomFormField
            name='invoice_type_id'
            label='Invoice Type'
            type='select'
            placeholder='Select invoice type'
            rules={{
              required: 'Invoice type is required'
            }}
            selectOptions={invoiceTypes.map(type => ({
              label: type.name,
              value: type.id
            }))}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Customer */}
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
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Material Only: Interaction */}
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
                      value={field.value ?? ''}
                      onValueChange={value => {
                        field.onChange(value)
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
                        <RadioGroupItem value='cash_and_pickup' id='inv_cash_and_pickup' />
                        <label
                          htmlFor='inv_cash_and_pickup'
                          className='text-sm font-medium leading-none cursor-pointer'
                        >
                          Cash and Pickup
                        </label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='cash_and_delivery' id='inv_cash_and_delivery' />
                        <label
                          htmlFor='inv_cash_and_delivery'
                          className='text-sm font-medium leading-none cursor-pointer'
                        >
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
                control={control}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />

              <CustomFormField
                name='pickup_location_id'
                label='Pickup Location'
                type='select'
                placeholder='Select pickup location'
                rules={{ required: 'Pickup location is required' }}
                selectOptions={businessLocations.map(loc => ({
                  label: loc.name,
                  value: loc.id
                }))}
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

          {/* Business Location */}
          <CustomFormField
            name='location_id'
            label='Business Location'
            type='select'
            placeholder='Select business location'
            selectOptions={businessLocations.map(loc => ({ value: loc.id, label: loc.name }))}
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
            placeholder={selectedClient ? 'Select address' : 'Select customer first'}
            disabled={!selectedClient}
            selectOptions={addressOptions.map(address => {
              const label = [address.street_address, address.city?.name, address.state?.name, address.zip_code]
                .filter(Boolean)
                .join(', ')

              return { value: address.id, label: `${address.title} - ${label}` }
            })}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Assigned Staff */}
          <CustomFormField
            name='assign_id'
            label='Assigned To'
            type='combobox'
            placeholder='Select assigned staff'
            rules={{
              required: 'Assigned staff is required'
            }}
            selectOptions={staffs.map(staff => ({
              value: staff.id,
              label: `${staff.first_name} ${staff.last_name}`
            }))}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Payment Term */}
          <CustomFormField
            name='payment_term_id'
            label='Payment Term'
            type='select'
            placeholder='Select payment term'
            rules={{
              required: 'Payment term is required'
            }}
            selectOptions={paymentTerms.map(term => ({
              value: term.id,
              label: term.name
            }))}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Issue Date */}
          <CustomFormField
            name='issue_date'
            label='Issue Date'
            type='datepicker'
            placeholder='Select issue date'
            rules={{ required: 'Issue date is required' }}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Due Date */}
          <CustomFormField
            name='due_date'
            label='Due Date'
            type='datepicker'
            placeholder='Select due date'
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Tax Rate */}
          <CustomFormField
            name='tax_rate'
            label='Tax Rate (%)'
            type='number'
            placeholder='Enter tax rate'
            register={register}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditInvoiceModal
