'use client'

import React, { useEffect, useState } from 'react'
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
  partners,
  workOrders,
  onSuccess
}: ScheduleFormDialogProps) {
  const [isFetchingWO, setIsFetchingWO] = useState(false)
  const [woServices, setWoServices] = useState<ProposalService[]>([])

  const form = useForm<FormValues>({
    defaultValues: buildDefaults(defaultDate, defaultContractorId)
  })

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { isSubmitting, errors }
  } = form

  // Reset form when dialog opens
  useEffect(() => {
    if (!open) return

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
      reset(buildDefaults(defaultDate, defaultContractorId))
      setWoServices([])
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
      setValue('title', `#${basic.work_order_number} - ${basic.title}`)
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
      const baseTitle = wo ? `#${wo.work_order_number} - ${wo.title}` : ''
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

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'edit' ? 'Edit Appointment' : 'Add Appointment'}
      maxWidth='lg'
      isLoading={isSubmitting}
      loadingMessage='Saving...'
      disableClose={isSubmitting}
      actions={
        <div className='flex justify-end gap-2 w-full'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type='submit' form='schedule-form' disabled={isSubmitting || isFetchingWO}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id='schedule-form' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          <div className='grid grid-cols-[140px_1fr] items-start gap-x-3 gap-y-4'>
            {/* Work Order */}
            <FormField
              control={control}
              name='work_order_id'
              rules={{ required: 'Work order is required' }}
              render={({ field }) => (
                <>
                  <FormLabel className='text-right pt-2 text-sm'>
                    Open Jobs <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormItem className='m-0'>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={val => handleWorkOrderChange(val, field.onChange)}
                        disabled={isFetchingWO}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select Work Order Number' />
                        </SelectTrigger>
                        <SelectContent>
                          {workOrders.map(wo => (
                            <SelectItem key={wo.id} value={wo.id}>
                              #{wo.work_order_number} – {wo.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </>
              )}
            />

            {/* Service Group → Service Type (only shown when WO has services) */}
            {(woServices.length > 0 || isFetchingWO) && (
              <FormField
                control={control}
                name='service_group_id'
                rules={{ required: 'Service type is required' }}
                render={({ field }) => (
                  <>
                    <FormLabel className='text-right pt-2 text-sm'>
                      Service Type <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormItem className='m-0'>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={val => handleServiceGroupChange(val, field.onChange)}
                          disabled={isFetchingWO}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder={isFetchingWO ? 'Loading services...' : 'Select Service Type'} />
                          </SelectTrigger>
                          <SelectContent>
                            {woServices.map(svc => (
                              <SelectItem key={svc.id} value={svc.id}>
                                {svc.service_type?.name ?? svc.service_type_id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </>
                )}
              />
            )}

            {/* Title */}
            <FormField
              control={control}
              name='title'
              render={({ field }) => (
                <>
                  <FormLabel className='text-right pt-2 text-sm'>Title</FormLabel>
                  <FormItem className='m-0'>
                    <FormControl>
                      <Input {...field} placeholder='Auto-filled from Work Order' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </>
              )}
            />

            {/* Contractor */}
            <FormField
              control={control}
              name='contractor_id'
              rules={{ required: 'Contractor is required' }}
              render={({ field }) => (
                <>
                  <FormLabel className='text-right pt-2 text-sm'>
                    Select Contractor <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormItem className='m-0'>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select Contractor' />
                        </SelectTrigger>
                        <SelectContent>
                          {partners.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {`${p.first_name} ${p.last_name}`.trim()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </>
              )}
            />

            {/* Start Date / Time */}
            <FormField
              control={control}
              name='starting_date'
              render={({ field }) => (
                <>
                  <FormLabel className='text-right pt-2 text-sm'>Start Date/Time</FormLabel>
                  <FormItem className='m-0'>
                    <div className='flex gap-2'>
                      <FormControl>
                        <DatePicker
                          value={field.value ? new Date(field.value + 'T00:00:00') : null}
                          onChange={(date: Date | null) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                          className='flex-1'
                        />
                      </FormControl>
                      <Controller
                        control={control}
                        name='starting_time'
                        render={({ field: tf }) => (
                          <TimePicker value={tf.value || null} onChange={tf.onChange} className='flex-1' />
                        )}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                </>
              )}
            />

            {/* End Date / Time */}
            <FormField
              control={control}
              name='ending_date'
              render={({ field }) => (
                <>
                  <FormLabel className='text-right pt-2 text-sm'>End Date/Time</FormLabel>
                  <FormItem className='m-0'>
                    <div className='flex gap-2'>
                      <FormControl>
                        <DatePicker
                          value={field.value ? new Date(field.value + 'T00:00:00') : null}
                          onChange={(date: Date | null) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                          className='flex-1'
                        />
                      </FormControl>
                      <Controller
                        control={control}
                        name='ending_time'
                        render={({ field: tf }) => (
                          <TimePicker value={tf.value || null} onChange={tf.onChange} className='flex-1' />
                        )}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                </>
              )}
            />

            {/* Show Schedule */}
            <FormField
              control={control}
              name='is_show_schedule'
              render={({ field }) => (
                <>
                  <FormLabel className='text-right pt-1 text-sm'>Show Schedule</FormLabel>
                  <FormItem className='m-0'>
                    <div className='flex items-center gap-2'>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <span className='text-xs text-muted-foreground'>{field.value ? 'YES' : 'NO'}</span>
                    </div>
                  </FormItem>
                </>
              )}
            />
          </div>

          {/* Notification toggles — 2-column grid */}
          <div className='grid grid-cols-2 gap-3 border border-border rounded-md p-3'>
            {TOGGLE_FIELDS.map(({ label, key }) => (
              <FormField
                key={key}
                control={control}
                name={key as keyof FormValues}
                render={({ field }) => (
                  <FormItem className='m-0'>
                    <div className='flex items-center justify-between gap-2'>
                      <FormLabel className='text-sm font-normal'>{label}</FormLabel>
                      <div className='flex items-center gap-1.5'>
                        <FormControl>
                          <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
                        </FormControl>
                        <span className='text-xs text-muted-foreground w-6'>
                          {(field.value as boolean) ? 'YES' : 'NO'}
                        </span>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            ))}
          </div>

          {/* Special Instructions */}
          <FormField
            control={control}
            name='special_instructions'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm'>Special Instructions</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder='Special instructions...' rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Internal Comments */}
          <FormField
            control={control}
            name='internal_commands'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm'>Internal Comments</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder='Internal comments...' rows={3} />
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
