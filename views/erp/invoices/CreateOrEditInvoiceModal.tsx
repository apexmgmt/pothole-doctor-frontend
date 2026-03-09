'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import InvoiceService from '@/services/api/invoices.service'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/datePicker'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { DateTimePicker } from '@/components/ui/datetime-picker'

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
  businessLocations
}: CreateOrEditInvoiceModalProps) => {
  const form = useForm<InvoicePayload>({
    defaultValues: {
      title: '',
      service_type_id: '',
      invoice_type_id: '',
      client_id: '',
      assign_id: '',
      payment_term_id: '',
      location: '',
      expiration_date: '',
      biding_date: '',
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

  useEffect(() => {
    if (open) {
      form.reset({
        title: invoiceDetails?.title || '',
        service_type_id: invoiceDetails?.service_type_id || '',
        invoice_type_id: invoiceDetails?.invoice_type_id || '',
        client_id: invoiceDetails?.client_id || '',
        assign_id: invoiceDetails?.assign_id || '',
        payment_term_id: invoiceDetails?.payment_term_id || '',
        location: invoiceDetails?.delivery_location || '',
        expiration_date: invoiceDetails?.due_date || '',
        biding_date: invoiceDetails?.issue_date || '',
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
      location: values.location,
      expiration_date: values.expiration_date,
      biding_date: values.biding_date,
      tax_rate: values.tax_rate,
      ...(isMaterialOnly && {
        interaction: values.interaction,
        ...(values.interaction === 'cash_and_pickup' && {
          pickup_date: values.pickup_date,
          pickup_location_id: values.pickup_location_id,
          pickup_notes: values.pickup_notes
        }),
        ...(values.interaction === 'cash_and_delivery' && {
          delivery_datetime: values.delivery_datetime,
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

        if (onCreateSuccess) {
          const updatedResponse = await InvoiceService.show(invoiceId)

          onCreateSuccess(updatedResponse.data)
        } else {
          onSuccess?.()
        }
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

  const defaultAddress = addressOptions.find(addr => addr.is_default === 1)
    ? [
        addressOptions.find(addr => addr.is_default === 1)?.street_address,
        addressOptions.find(addr => addr.is_default === 1)?.city?.name,
        addressOptions.find(addr => addr.is_default === 1)?.state?.name,
        addressOptions.find(addr => addr.is_default === 1)?.zip_code
      ]
        .filter(Boolean)
        .join(', ')
    : ''

  useEffect(() => {
    if (defaultAddress) {
      form.setValue('location', defaultAddress)
    } else {
      form.setValue('location', '')
    }
  }, [form.watch('client_id')])

  return (
    <CommonDialog
      isLoading={form.formState.isSubmitting}
      loadingMessage='Saving invoice...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Invoice' : 'Edit Invoice'}
      description={mode === 'create' ? 'Add a new invoice to the system' : 'Update invoice information'}
      maxWidth='4xl'
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
                ? 'Create & Add Services →'
                : 'Update & Edit Services →'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid grid-cols-2 gap-4'>
          {/* Title */}
          <FormField
            control={form.control}
            name='title'
            rules={{ required: 'Invoice title is required', minLength: { value: 2, message: 'Min 2 characters' } }}
            render={({ field }) => (
              <FormItem className='col-span-2'>
                <FormLabel>
                  Title <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter invoice title' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Invoice Type */}
          <FormField
            control={form.control}
            name='invoice_type_id'
            rules={{ required: 'Invoice type is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Invoice Type <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select Invoice Type' />
                    </SelectTrigger>
                    <SelectContent>
                      {invoiceTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Customer */}
          <FormField
            control={form.control}
            name='client_id'
            rules={{ required: 'Customer is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Customer <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={value => {
                      field.onChange(value)
                      form.setValue('location', '')
                    }}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select Customer' />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.first_name} {client.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Material Only: Interaction */}
          {isMaterialOnly && (
            <FormField
              control={form.control}
              name='interaction'
              rules={{ required: 'Interaction type is required' }}
              render={({ field }) => (
                <FormItem className='col-span-2'>
                  <FormLabel>
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
              <FormField
                control={form.control}
                name='pickup_date'
                rules={{ required: 'Date of pickup is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Date of Pickup <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(field.value) : null}
                        onChange={val => field.onChange(val ? val.toISOString().slice(0, 10) : '')}
                        placeholder='Select pickup date'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='pickup_location_id'
                rules={{ required: 'Pickup location is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Pickup Location <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Select value={field.value ?? ''} onValueChange={field.onChange}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select Pickup Location' />
                        </SelectTrigger>
                        <SelectContent>
                          {businessLocations.length === 0 ? (
                            <div className='px-3 py-2 text-muted-foreground text-sm'>No locations found</div>
                          ) : (
                            businessLocations.map(loc => (
                              <SelectItem key={loc.id} value={loc.id}>
                                {loc.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='pickup_notes'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Enter notes...' rows={3} {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
                  <FormItem>
                    <FormLabel>
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
              <FormField
                control={form.control}
                name='delivery_location'
                rules={{ required: 'Delivery location is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Delivery Location <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Enter delivery location' {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='delivery_notes'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Enter notes...' rows={3} {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {/* Location / Job Address */}
          <FormField
            control={form.control}
            name='location'
            render={({ field }) => (
              <FormItem className='col-span-2'>
                <FormLabel>Event Location</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange} disabled={!selectedClient}>
                    <SelectTrigger className='w-full h-auto text-left whitespace-normal'>
                      <SelectValue placeholder={selectedClient ? 'Select Address' : 'Select Customer first'} />
                    </SelectTrigger>
                    <SelectContent>
                      {addressOptions.length === 0 ? (
                        <div className='px-3 py-2 text-muted-foreground text-sm'>No addresses found</div>
                      ) : (
                        addressOptions.map(address => {
                          const value = [
                            address.street_address,
                            address.city?.name,
                            address.state?.name,
                            address.zip_code
                          ]
                            .filter(Boolean)
                            .join(', ')

                          return (
                            <SelectItem key={address.id} value={value}>
                              {address.title} - {value}
                            </SelectItem>
                          )
                        })
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Assigned Staff */}
          <FormField
            control={form.control}
            name='assign_id'
            rules={{ required: 'Assigned staff is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Assigned To <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select Staff' />
                    </SelectTrigger>
                    <SelectContent>
                      {staffs.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.first_name} {staff.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Service Type */}
          <FormField
            control={form.control}
            name='service_type_id'
            rules={{ required: 'Service type is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Service Type <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select Service Type' />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select Payment Term' />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTerms.map(term => (
                        <SelectItem key={term.id} value={term.id}>
                          {term.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Issue Date */}
          <FormField
            control={form.control}
            name='biding_date'
            rules={{ required: 'Issue date is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Issue Date <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value ? new Date(field.value) : null}
                    onChange={val => field.onChange(val ? val.toISOString().slice(0, 10) : '')}
                    placeholder='Select issue date'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Due Date */}
          <FormField
            control={form.control}
            name='expiration_date'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value ? new Date(field.value) : null}
                    onChange={val => field.onChange(val ? val.toISOString().slice(0, 10) : '')}
                    placeholder='Select due date'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Tax Rate */}
          <FormField
            control={form.control}
            name='tax_rate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Rate (%)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    step='0.01'
                    placeholder='0'
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditInvoiceModal
