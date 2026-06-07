'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  BusinessLocation,
  Client,
  EstimateType,
  WorkOrder,
  WorkOrderPayload,
  PaymentTerm,
  ServiceType,
  Staff
} from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import WorkOrderService from '@/services/api/work-orders/work_orders.service'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import CustomFormField from '@/components/form/CustomFormField'

interface EditWorkOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workOrderId?: string
  workOrderDetails?: WorkOrder
  onSuccess?: (updatedWorkOrder: WorkOrder) => void
  workOrderTypes: EstimateType[]
  serviceTypes: ServiceType[]
  clients: Client[]
  staffs: Staff[]
  paymentTerms: PaymentTerm[]
  businessLocations: BusinessLocation[]
}

const EditWorkOrderModal = ({
  open,
  onOpenChange,
  workOrderId,
  workOrderDetails,
  onSuccess,
  workOrderTypes,
  serviceTypes,
  clients,
  staffs,
  paymentTerms,
  businessLocations
}: EditWorkOrderModalProps) => {
  const form = useForm<WorkOrderPayload>({
    defaultValues: {
      title: '',
      service_type_id: '',
      work_order_type_id: '',
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
    reset,
    watch,
    setValue,
    setError,
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = form

  useEffect(() => {
    if (open) {
      reset({
        title: workOrderDetails?.title || '',
        service_type_id: workOrderDetails?.service_type_id || '',
        work_order_type_id: workOrderDetails?.work_order_type_id || '',
        client_id: workOrderDetails?.client_id || '',
        assign_id: workOrderDetails?.assign_id || '',
        payment_term_id: workOrderDetails?.payment_term_id || '',
        address_id: workOrderDetails?.address_id || '',
        location_id: workOrderDetails?.location_id || '',
        due_date: workOrderDetails?.due_date || '',
        issue_date: workOrderDetails?.issue_date || '',
        interaction:
          (workOrderDetails?.interaction as '' | 'cash_and_pickup' | 'cash_and_delivery' | null | undefined) || '',
        pickup_date: workOrderDetails?.pickup_date || '',
        pickup_location_id: workOrderDetails?.pickup_location_id || '',
        pickup_notes: workOrderDetails?.pickup_notes || '',
        delivery_datetime: workOrderDetails?.delivery_datetime || null,
        delivery_location: workOrderDetails?.delivery_location || '',
        delivery_notes: workOrderDetails?.delivery_notes || '',
        tax_rate: workOrderDetails?.tax_rate || 0
      })
    }
  }, [workOrderDetails, open, reset])

  const onSubmit = async (values: WorkOrderPayload) => {
    if (!workOrderId) return

    const isMaterialOnly = workOrderTypes.find(t => t.id === values.work_order_type_id)?.name === 'Material Only'

    const payload: WorkOrderPayload = {
      title: values.title,
      service_type_id: values.service_type_id,
      work_order_type_id: values.work_order_type_id,
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

    try {
      const response = await WorkOrderService.update(workOrderId, payload)
      const updatedWorkOrder = response?.data

      toast.success('Work order updated successfully')
      reset()
      onOpenChange(false)
      onSuccess?.(updatedWorkOrder)
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to update work order')
    }
  }

  const onCancel = () => {
    reset()
    onOpenChange(false)
  }

  const selectedClient = useMemo(
    () => clients.find(c => c.id === watch('client_id')),
    [clients, watch('client_id')]
  )

  const isMaterialOnly = useMemo(
    () => workOrderTypes.find(t => t.id === watch('work_order_type_id'))?.name === 'Material Only',
    [workOrderTypes, watch('work_order_type_id')]
  )

  const interactionValue = watch('interaction')
  const addressOptions = selectedClient?.addresses || []

  // Find default address ID and auto-set when client changes
  const defaultAddressId = addressOptions.find(addr => addr.is_default === 1)?.id ?? ''

  // When client changes, auto-select default address and client's business location
  useEffect(() => {
    setValue('address_id', defaultAddressId)

    // setValue('location_id', selectedClient?.location_id ?? '')
  }, [watch('client_id')])

  const fieldStyle = 'grid grid-cols-[152px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  return (
    <CommonDialog
      isLoading={isSubmitting}
      loadingMessage='Saving work order...'
      open={open}
      onOpenChange={onOpenChange}
      title='Edit Work Order'
      description='Update work order information'
      className='sm:max-w-264!'
      disableClose={isSubmitting}
      actions={
        <div className='flex gap-3'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onCancel}
            disabled={isSubmitting}
            className='flex-1'
          >
            Cancel
          </Button>
          <Button
            type='submit'
            size='sm'
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className='flex-1'
          >
            {isSubmitting ? 'Saving...' : 'Update & Edit Services →'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2'>
          {/* Title */}
          <CustomFormField
            name='title'
            label='Title'
            placeholder='Enter work order title'
            rules={{ required: 'Work order title is required', minLength: { value: 2, message: 'Min 2 characters' } }}
            register={register}
            errors={errors}
            fieldClassName={`sm:col-span-2 ${fieldStyle}`}
            labelClassName={labelStyle}
          />
          
          {/* Work Order Type */}
          <CustomFormField
            name='work_order_type_id'
            label='Work Order Type'
            type='select'
            placeholder='Select Work Order Type'
            rules={{ required: 'Work order type is required' }}
            selectOptions={workOrderTypes.map(type => ({
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
            placeholder='Select Customer'
            rules={{ required: 'Customer is required' }}
            selectOptions={clients.map(client => ({
              label: `${client.first_name} ${client.last_name}`,
              value: client.id
            }))}
            onChange={() => {
              setValue('address_id', '')
            }}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
          
          {/* Material Only: Interaction */}
          {isMaterialOnly && (
            <CustomFormField
              name='interaction'
              label='Interaction'
              type='radio'
              rules={{ required: 'Interaction type is required' }}
              control={control}
              errors={errors}
              fieldClassName={`sm:col-span-2 py-3 ${fieldStyle}`}
              labelClassName={labelStyle}
              className='flex flex-row gap-6'
              selectOptions={[
                { value: 'cash_and_pickup', label: 'Cash and Pickup' },
                { value: 'cash_and_delivery', label: 'Cash and Delivery' }
              ]}
              onChange={() => {
                setValue('pickup_date', '')
                setValue('pickup_location_id', '')
                setValue('pickup_notes', '')
                setValue('delivery_datetime', null)
                setValue('delivery_location', '')
                setValue('delivery_notes', '')
              }}
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
                placeholder='Select Pickup Location'
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
                control={control}
                name='delivery_datetime'
                rules={{ required: 'Date & time of delivery is required' }}
                render={({ field }) => (
                  <FormItem className={fieldStyle}>
                    <FormLabel className={`text-xs data-[error=true]:text-card-foreground ${labelStyle}`}>
                      Date &amp; Time of Delivery <span className='text-red-500'>*</span>
                    </FormLabel>
                    <div>
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
                      <FormMessage className='mt-1.5' />
                    </div>
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
            placeholder='Select Business Location'
            selectOptions={businessLocations.map(loc => ({
              label: loc.name,
              value: loc.id
            }))}
            control={control}
            errors={errors}
            fieldClassName={`sm:col-span-2 ${fieldStyle}`}
            labelClassName={labelStyle}
            disabled={true}
          />
          
          {/* Event Location (Client Address) */}
          <CustomFormField
            name='address_id'
            label='Event Location'
            type='select'
            placeholder={selectedClient ? 'Select Address' : 'Select Customer first'}
            selectOptions={addressOptions.map(address => {
              const label = [
                address.street_address,
                address.city?.name,
                address.state?.name,
                address.zip_code
              ]
                .filter(Boolean)
                .join(', ')

              return { label: `${address.title} - ${label}`, value: address.id }
            })}
            control={control}
            errors={errors}
            fieldClassName={`sm:col-span-2 ${fieldStyle}`}
            labelClassName={labelStyle}
            disabled={!selectedClient}
          />
          
          {/* Assigned Staff */}
          <CustomFormField
            name='assign_id'
            label='Assigned To'
            type='combobox'
            placeholder='Select Staff'
            rules={{ required: 'Assigned staff is required' }}
            selectOptions={staffs.map(staff => ({
              label: `${staff.first_name} ${staff.last_name}`,
              value: staff.id
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
            placeholder='Select Payment Term'
            rules={{ required: 'Payment term is required' }}
            selectOptions={paymentTerms.map(term => ({
              label: term.name,
              value: term.id
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
            placeholder='0'
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

export default EditWorkOrderModal
