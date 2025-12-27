'use client'

import { useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import {
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
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import EstimateService from '@/services/api/estimates.service'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/datePicker'

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
  paymentTerms
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
      location: estimateDetails?.location || '',
      expiration_date: estimateDetails?.expiration_date || '',
      biding_date: estimateDetails?.biding_date || ''
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
        location: estimateDetails?.location || '',
        expiration_date: estimateDetails?.expiration_date || '',
        biding_date: estimateDetails?.biding_date || ''
      })
    }
  }, [estimateDetails, open, form])

  const onSubmit = async (values: EstimatePayload) => {
    const payload: EstimatePayload = {
      title: values.title,
      service_type_id: values.service_type_id,
      estimate_type_id: values.estimate_type_id,
      client_id: values.client_id,
      assign_id: values.assign_id,
      payment_term_id: values.payment_term_id,
      location: values.location,
      expiration_date: values.expiration_date,
      biding_date: values.biding_date
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
      location: estimateDetails?.location || '',
      expiration_date: estimateDetails?.expiration_date || '',
      biding_date: estimateDetails?.biding_date || ''
    })
    onOpenChange(false)
  }

  // Memoize addresses for selected client
  const selectedClient = useMemo(
    () => clients.find(c => c.id === form.watch('client_id')),
    [clients, form.watch('client_id')]
  )

  const addressOptions = selectedClient?.addresses || []

  // Find default address value (comma separated)
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

  // When client changes, set location to default address (comma separated) if available
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
      loadingMessage='Loading estimate...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Estimate' : 'Edit Estimate'}
      description={mode === 'create' ? 'Add a new estimate to the system' : 'Update estimate information'}
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
            {form.formState.isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* Estimate Title Field */}
          <FormField
            control={form.control}
            name='title'
            rules={{
              required: 'Estimate title is required',
              minLength: { value: 2, message: 'Estimate title must be at least 2 characters' }
            }}
            render={({ field }) => (
              <FormItem>
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
                <FormLabel>Estimate Type <span className='text-red-500'>*</span></FormLabel>
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
                <FormLabel>Customer <span className='text-red-500'>*</span></FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={value => {
                      field.onChange(value)

                      // Reset location when customer changes
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
          {/* Location field (address select) */}
          <FormField
            control={form.control}
            name='location'
            render={({ field }) => (
              <FormItem className='col-span-1 lg:col-span-2'>
                <FormLabel>Event Location</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange} disabled={!selectedClient}>
                    <SelectTrigger className='w-full'>
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
          {/* Assigned Estimator field */}
          <FormField
            control={form.control}
            name='assign_id'
            rules={{
              required: 'Assigned estimator is required'
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned Estimator <span className='text-red-500'>*</span></FormLabel>
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
                <FormLabel>Service Type <span className='text-red-500'>*</span></FormLabel>
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
                <FormLabel>Payment Term <span className='text-red-500'>*</span></FormLabel>
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
                <FormLabel>Bidding Date <span className='text-red-500'>*</span></FormLabel>
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
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditEstimateModal
