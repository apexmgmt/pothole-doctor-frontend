'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { format } from 'date-fns/format'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/datePicker'
import { TimePicker } from '@/components/ui/timePicker'
import { Partner, ProposalService, WorkOrder } from '@/types'
import CustomFormField from '@/components/form/CustomFormField'
import { Schedule, SchedulePayload } from '@/types/schedules'
import ScheduleService from '@/services/api/schedules.service'
import WorkOrderService from '@/services/api/work-orders/work_orders.service'
import { toast } from 'sonner'

interface FormValues {
  work_order_id: string
  contractor_id: string
  salesman_id: string
  client_id: string
  title: string
  service_group_id: string
  service_type_id: string
  starting_date: string
  starting_time: string
  ending_date: string
  ending_time: string
  is_show_schedule: boolean
  is_sms_contractor: boolean
  is_email_contractor: boolean
  is_sms_customer: boolean
  is_email_customer: boolean
  is_sms_salesman: boolean
  is_email_salesman: boolean
  special_instructions: string
  internal_commands: string
}

const buildDefaults = (date?: Date, contractorId?: string): FormValues => ({
  work_order_id: '',
  contractor_id: contractorId || '',
  salesman_id: '',
  client_id: '',
  title: '',
  service_group_id: '',
  service_type_id: '',
  starting_date: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
  starting_time: '',
  ending_date: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
  ending_time: '',
  is_show_schedule: true,
  is_sms_contractor: false,
  is_email_contractor: true,
  is_sms_customer: false,
  is_email_customer: true,
  is_sms_salesman: false,
  is_email_salesman: false,
  special_instructions: '',
  internal_commands: ''
})

const TOGGLE_FIELDS: Array<{ label: string; key: keyof FormValues }> = [
  { label: 'SMS Contractor', key: 'is_sms_contractor' },
  { label: 'Email Contractor', key: 'is_email_contractor' },
  { label: 'SMS Customer', key: 'is_sms_customer' },
  { label: 'Email Customer', key: 'is_email_customer' },
  { label: 'SMS Salesman', key: 'is_sms_salesman' },
  { label: 'Email Salesman', key: 'is_email_salesman' }
]

interface ScheduleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  schedule?: Schedule | null
  defaultDate?: Date
  defaultContractorId?: string
  defaultWorkOrderId?: string
  defaultServiceGroupId?: string
  defaultServiceTypeId?: string
  partners: Partner[]
  workOrders: WorkOrder[]
  onSuccess: () => void
}

export default function ScheduleFormDialog({
  open,
  onOpenChange,
  mode,
  schedule,
  defaultDate,
  defaultContractorId,
  defaultWorkOrderId,
  defaultServiceGroupId,
  defaultServiceTypeId,
  partners,
  workOrders,
  onSuccess
}: ScheduleFormDialogProps) {
  const [isFetchingWO, setIsFetchingWO] = useState(false)
  const [woServices, setWoServices] = useState<ProposalService[]>([])

  // Tracks whether we've already applied the auto-prefilled service group title
  const didApplyDefaultServiceGroup = useRef(false)

  const form = useForm<FormValues>({
    defaultValues: buildDefaults(defaultDate, defaultContractorId)
  })

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    register,
    formState: { isSubmitting, errors }
  } = form

  // Reset form when dialog opens
  useEffect(() => {
    if (!open) {
      didApplyDefaultServiceGroup.current = false

      return
    }

    if (mode === 'edit' && schedule) {
      reset({
        work_order_id: schedule.work_order_id || '',
        contractor_id: schedule.contractor_id || '',
        salesman_id: schedule.salesman_id || '',
        client_id: schedule.client_id || '',
        title: schedule.title || '',
        service_group_id: schedule.service_group_id || '',
        service_type_id: schedule.service_type_id || '',
        starting_date: schedule.starting_date || '',
        starting_time: schedule.starting_time || '',
        ending_date: schedule.ending_date || '',
        ending_time: schedule.ending_time || '',
        is_show_schedule: schedule.is_show_schedule ?? true,
        is_sms_contractor: schedule.is_sms_contractor ?? false,
        is_email_contractor: schedule.is_email_contractor ?? true,
        is_sms_customer: schedule.is_sms_customer ?? false,
        is_email_customer: schedule.is_email_customer ?? true,
        is_sms_salesman: schedule.is_sms_salesman ?? false,
        is_email_salesman: schedule.is_email_salesman ?? false,
        special_instructions: schedule.special_instructions || '',
        internal_commands: schedule.internal_commands || ''
      })
      if (schedule.work_order_id) fetchWOServices(schedule.work_order_id)
    } else {
      // Build create defaults, optionally pre-filled from URL params
      const createDefaults = buildDefaults(defaultDate, defaultContractorId)

      if (defaultWorkOrderId) {
        createDefaults.work_order_id = defaultWorkOrderId
        const wo = workOrders.find(w => w.id === defaultWorkOrderId)

        if (wo) {
          createDefaults.salesman_id = wo.assign_id || ''
          createDefaults.client_id = wo.client_id || ''
          createDefaults.title = `#${wo.invoice_number_prefix ? `${wo.invoice_number_prefix}-` : ''}${wo.invoice_number?.toString() || '—'} - ${wo.title}`
        }
      }

      if (defaultServiceGroupId) createDefaults.service_group_id = defaultServiceGroupId
      if (defaultServiceTypeId) createDefaults.service_type_id = defaultServiceTypeId

      reset(createDefaults)

      if (defaultWorkOrderId) {
        fetchWOServices(defaultWorkOrderId)
      } else {
        setWoServices([])
      }
    }
  }, [open, mode, schedule])

  const fetchWOServices = async (workOrderId: string) => {
    setIsFetchingWO(true)

    try {
      const resp = await WorkOrderService.show(workOrderId)
      const wo: WorkOrder = resp?.data ?? resp

      setWoServices((wo.services as ProposalService[]) || [])
    } catch {
      setWoServices([])
    } finally {
      setIsFetchingWO(false)
    }
  }

  // After woServices loads for a pre-filled service group, update the title to include service type name
  useEffect(() => {
    if (woServices.length === 0 || didApplyDefaultServiceGroup.current) return

    const svcGroupId = form.getValues('service_group_id')

    if (!svcGroupId) return

    didApplyDefaultServiceGroup.current = true

    const svc = woServices.find(s => s.id === svcGroupId)

    if (!svc) return

    const currentWoId = form.getValues('work_order_id')
    const wo = workOrders.find(w => w.id === currentWoId)

    const baseTitle = wo
      ? `#${wo.invoice_number_prefix ? `${wo.invoice_number_prefix}-` : ''}${wo.invoice_number?.toString() || '—'} - ${wo.title}`
      : ''

    const serviceTypeName = svc.service_type?.name ?? ''

    setValue('title', serviceTypeName ? `${baseTitle} - ${serviceTypeName}` : baseTitle)
  }, [woServices])

  const handleWorkOrderChange = async (workOrderId: string, rhfOnChange: (v: string) => void) => {
    rhfOnChange(workOrderId)
    setValue('service_group_id', '')
    setValue('service_type_id', '')
    setWoServices([])

    if (!workOrderId) return

    const basic = workOrders.find(wo => wo.id === workOrderId)

    if (basic) {
      setValue('salesman_id', basic.assign_id || '')
      setValue('client_id', basic.client_id || '')
      setValue(
        'title',
        `#${basic.invoice_number_prefix ? `${basic.invoice_number_prefix}-` : ''}${basic.invoice_number?.toString() || '—'} - ${basic.title}`
      )
    }

    await fetchWOServices(workOrderId)
  }

  const handleServiceGroupChange = (serviceGroupId: string, rhfOnChange: (v: string) => void) => {
    rhfOnChange(serviceGroupId)

    const svc = woServices.find(s => s.id === serviceGroupId)

    if (svc) {
      setValue('service_type_id', svc.service_type_id || '', { shouldValidate: true })

      // Auto-update title with service type name
      const currentWoId = form.getValues('work_order_id')
      const wo = workOrders.find(w => w.id === currentWoId)

      const baseTitle = wo
        ? `#${wo.invoice_number_prefix ? `${wo.invoice_number_prefix}-` : ''}${wo.invoice_number?.toString() || '—'} - ${wo.title}`
        : ''

      const serviceTypeName = svc.service_type?.name ?? ''

      setValue('title', serviceTypeName ? `${baseTitle} - ${serviceTypeName}` : baseTitle)

      // Auto-fill contractor from the service group if present
      if (svc.contractor_id) {
        setValue('contractor_id', svc.contractor_id, { shouldValidate: true })
      }
    }
  }

  const onSubmit = async (values: FormValues) => {
    const payload: SchedulePayload = {
      work_order_id: values.work_order_id,
      contractor_id: values.contractor_id,
      salesman_id: values.salesman_id,
      client_id: values.client_id,
      title: values.title,
      starting_date: values.starting_date,
      starting_time: values.starting_time,
      ending_date: values.ending_date,
      ending_time: values.ending_time,
      is_show_schedule: values.is_show_schedule,
      is_sms_contractor: values.is_sms_contractor,
      is_email_contractor: values.is_email_contractor,
      is_sms_customer: values.is_sms_customer,
      is_email_customer: values.is_email_customer,
      is_sms_salesman: values.is_sms_salesman,
      is_email_salesman: values.is_email_salesman,
      special_instructions: values.special_instructions || null,
      internal_commands: values.internal_commands || null,
      ...(values.service_group_id && { service_group_id: values.service_group_id }),
      ...(values.service_type_id && { service_type_id: values.service_type_id })
    }

    try {
      if (mode === 'edit' && schedule) {
        await ScheduleService.update(schedule.id, payload)
        toast.success('Schedule updated successfully')
      } else {
        await ScheduleService.store(payload)
        toast.success('Schedule created successfully')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      if (error?.errors && typeof error.errors === 'object') {
        Object.entries(error.errors).forEach(([field, messages]) => {
          const msg = Array.isArray(messages) ? messages[0] : String(messages)

          form.setError(field as keyof FormValues, { type: 'server', message: msg })
        })
      }

      toast.error(error?.message || 'Failed to save schedule')
    }
  }

  const onCancel = () => {
    onOpenChange(false)
  }

  const fieldStyle = 'grid grid-cols-[130px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1 text-xs font-medium'

  return (
    <CommonDialog
      isLoading={isSubmitting}
      loadingMessage='Saving appointment...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'edit' ? 'Edit Appointment' : 'Add Appointment'}
      description={mode === 'edit' ? 'Update appointment information' : 'Add a new appointment to the system'}
      disableClose={isSubmitting}
      maxWidth='2xl'
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
            disabled={isSubmitting || isFetchingWO}
            className='flex-1'
          >
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Save'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-2'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2'>
            {/* Work Order */}
            <div className='col-span-2'>
              <CustomFormField
                name='work_order_id'
                type='select'
                label='Open Jobs'
                placeholder='Select Work Order Number'
                control={control}
                register={register}
                rules={{ required: 'Work order is required' }}
                selectOptions={workOrders.map(wo => ({
                  value: wo.id,
                  label: `#${wo.invoice_number_prefix ? `${wo.invoice_number_prefix}-` : ''}${wo.invoice_number?.toString() || '—'} - ${wo.title}`
                }))}
                onChange={val => handleWorkOrderChange(val as string, v => setValue('work_order_id', v))}
                disabled={isFetchingWO}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />
            </div>
            {/* Service Group */}
            {(woServices.length > 0 || isFetchingWO) && (
              <div className='col-span-2'>
                <CustomFormField
                  name='service_group_id'
                  type='select'
                  label='Service Type'
                  placeholder={isFetchingWO ? 'Loading services...' : 'Select Service Type'}
                  control={control}
                  register={register}
                  rules={{ required: 'Service type is required' }}
                  selectOptions={woServices.map(svc => ({
                    value: svc.id,
                    label: svc.service_type?.name ?? svc.service_type_id
                  }))}
                  onChange={val => handleServiceGroupChange(val as string, v => setValue('service_group_id', v))}
                  disabled={isFetchingWO}
                  errors={errors}
                  fieldClassName={fieldStyle}
                  labelClassName={labelStyle}
                />
              </div>
            )}

            {/* Title */}
            <div className='col-span-2'>
              <CustomFormField
                name='title'
                rules={{ required: 'Title is required' }}
                type='text'
                label='Title'
                placeholder='Auto-filled from Work Order'
                control={control}
                register={register}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />
            </div>

            {/* Contractor */}
            <div className='col-span-2'>
              <CustomFormField
                name='contractor_id'
                type='select'
                label='Select Contractor'
                placeholder='Select Contractor'
                control={control}
                register={register}
                rules={{ required: 'Contractor is required' }}
                selectOptions={partners.map(p => ({
                  value: p.id,
                  label: `${p.first_name} ${p.last_name}`.trim()
                }))}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />
            </div>
            {/* Start Date */}
            <CustomFormField
              name='starting_date'
              type='datepicker'
              label='Start Date'
              placeholder='Select start date'
              control={control}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            {/* Start Time */}
            <CustomFormField
              name='starting_time'
              type='time'
              label='Start Time'
              placeholder='Select start time'
              control={control}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            {/* End Date */}
            <CustomFormField
              name='ending_date'
              type='datepicker'
              label='End Date'
              placeholder='Select end date'
              control={control}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            {/* End Time */}
            <CustomFormField
              name='ending_time'
              type='time'
              label='End Time'
              placeholder='Select end time'
              control={control}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            {/* Show Schedule */}
            <div className={`sm:col-span-2 gap-x-2 ${fieldStyle}`}>
              <CustomFormField
                name='is_show_schedule'
                type='switch'
                label='Show Schedule'
                control={control}
                register={register}
                errors={errors}
                fieldClassName={`${fieldStyle} [&>button]:order-2 [&>label]:order-1`}
                labelClassName={labelStyle}
              />
            </div>

            {/* Notification toggles — 2-column grid */}
            {TOGGLE_FIELDS.map(({ label, key }) => (
              <CustomFormField
                key={key}
                name={key as keyof FormValues}
                type='switch'
                label={label}
                control={control}
                register={register}
                errors={errors}
                fieldClassName={`${fieldStyle} [&>button]:order-2 [&>label]:order-1`}
                labelClassName={labelStyle}
              />
            ))}
          </div>
          {/* Special Instructions */}
          <CustomFormField
            name='special_instructions'
            type='textarea'
            label='Special Instructions'
            placeholder='Special instructions...'
            control={control}
            register={register}
            errors={errors}
            fieldClassName={`col-span-1 sm:col-span-2 ${fieldStyle}`}
            labelClassName={labelStyle}
          />

          {/* Internal Comments */}
          <CustomFormField
            name='internal_commands'
            type='textarea'
            label='Internal Comments'
            placeholder='Internal comments...'
            control={control}
            register={register}
            errors={errors}
            fieldClassName={`col-span-1 sm:col-span-2 ${fieldStyle}`}
            labelClassName={labelStyle}
          />
        </form>
      </Form>
    </CommonDialog>
  )
}
