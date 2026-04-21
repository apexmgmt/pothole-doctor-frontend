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
  businessLocations
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

  // Reset form when estimateDetails changes or modal opens
  useEffect(() => {
    if (open) {
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
    form.setValue('location_id', selectedClient?.location_id ?? '')
  }, [form.watch('client_id')])

  return (
    <CommonDialog
      isLoading={form.formState.isSubmitting}
      loadingMessage='Loading estimate...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Estimate' : 'Edit Estimate'}
      description={mode === 'create' ? 'Add a new estimate to the system' : 'Update estimate information'}
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
            {form.formState.isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid grid-cols-2 gap-4'>
          {/* Estimate Title Field */}
          <FormField
            control={form.control}
            name='title'
            rules={{
              required: 'Estimate title is required',
              minLength: { value: 2, message: 'Estimate title must be at least 2 characters' }
            }}
            render={({ field }) => (
              <FormItem className='col-span-2'>
                <FormLabel>
                  Title <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter estimate title' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Estimate type field */}
          <FormField
            control={form.control}
            name='estimate_type_id'
            rules={{
              required: 'Estimate type is required'
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Estimate Type <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select Estimate Type' />
                    </SelectTrigger>
                    <SelectContent>
                      {estimateTypes.map(type => (
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
          {/* Client field */}
          <FormField
            control={form.control}
            name='client_id'
            rules={{
              required: 'Customer is required'
            }}
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

                      // Reset address and location when customer changes (useEffect will auto-set defaults)
                      form.setValue('address_id', '')
                      form.setValue('location_id', '')
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
          {/* Material Only: Interaction field */}
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
                        onChange={val => {
                          field.onChange(val ? val.toISOString().slice(0, 10) : '')
                        }}
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
                      <Textarea
                        placeholder='Enter notes...'
                        rows={3}
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        value={field.value ?? ''}
                      />
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
                      <Input
                        placeholder='Enter delivery location'
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        value={field.value ?? ''}
                      />
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
                      <Textarea
                        placeholder='Enter notes...'
                        rows={3}
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {/* Location field (address select) */}
          {/* Business Location */}
          <FormField
            control={form.control}
            name='location_id'
            render={({ field }) => (
              <FormItem className='col-span-2'>
                <FormLabel>Business Location</FormLabel>
                <FormControl>
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select Business Location' />
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
          {/* Event Location (Client Address) */}
          <FormField
            control={form.control}
            name='address_id'
            render={({ field }) => (
              <FormItem className='col-span-2'>
                <FormLabel>Event Location</FormLabel>
                <FormControl>
                  <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={!selectedClient}>
                    <SelectTrigger className='w-full h-auto text-left whitespace-normal'>
                      <SelectValue placeholder={selectedClient ? 'Select Address' : 'Select Customer first'} />
                    </SelectTrigger>
                    <SelectContent>
                      {addressOptions.length === 0 ? (
                        <div className='px-3 py-2 text-muted-foreground text-sm'>No addresses found</div>
                      ) : (
                        addressOptions.map(address => {
                          const label = [
                            address.street_address,
                            address.city?.name,
                            address.state?.name,
                            address.zip_code
                          ]
                            .filter(Boolean)
                            .join(', ')

                          return (
                            <SelectItem key={address.id} value={address.id}>
                              {address.title} - {label}
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
          {/* Assigned Estimator field */}
          <FormField
            control={form.control}
            name='assign_id'
            rules={{
              required: 'Assigned estimator is required'
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Assigned Estimator <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select Assigned Estimator' />
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
          {/* Service type field */}
          <FormField
            control={form.control}
            name='service_type_id'
            rules={{
              required: 'Service type is required'
            }}
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
          {/* Payment terms field */}
          <FormField
            control={form.control}
            name='payment_term_id'
            rules={{
              required: 'Payment term is required'
            }}
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
          {/* Expiry Date field */}
          <FormField
            control={form.control}
            name='expiration_date'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiration Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value ? new Date(field.value) : null}
                    onChange={val => {
                      field.onChange(val ? val.toISOString().slice(0, 10) : '')
                    }}
                    placeholder='Select expiration date'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Bidding Date field */}
          <FormField
            control={form.control}
            name='biding_date'
            rules={{
              required: 'Bidding date is required'
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Bidding Date <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value ? new Date(field.value) : null}
                    onChange={val => {
                      field.onChange(val ? val.toISOString().slice(0, 10) : '')
                    }}
                    placeholder='Select bidding date'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Tax Rate field */}
          <FormField
            control={form.control}
            name='tax_rate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Rate</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    step='0.01'
                    placeholder='Enter tax rate'
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

export default CreateOrEditEstimateModal
