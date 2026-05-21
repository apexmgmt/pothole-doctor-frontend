'use client'

import { useEffect } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'
import { format } from 'date-fns'

import { BusinessLocation, MaterialJob, MaterialJobActionPayload, Staff, Warehouse } from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/datePicker'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import MaterialJobService from '@/services/api/products/material-jobs.service'
import { mathRoundFixed } from '@/utils/utility'

interface AddInventoryJobActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  materialJob: MaterialJob | null
  staffs: Staff[]
  warehouses: Warehouse[]
  businessLocations: BusinessLocation[]
  onSuccess: () => void
}

interface FormValues {
  action_status: string
  action_date: Date | null
  employee_id: string
  quantity: number | string
  warehouse_type: 'warehouse' | 'location'
  warehouse_id: string
  stock_area: string
  stock_section: string
  location_notes: string
}

type ActionStage = 'allocated' | 'prepared' | 'picked_up'

const ACTION_STATUS_OPTIONS = [
  { value: 'allocated', label: 'Allocated' },
  { value: 'prepared', label: 'Prepared' },
  { value: 'picked_up', label: 'Picked Up' }
]

const normalizeActionStatus = (status?: string | null): ActionStage | null => {
  if (!status) return null

  const normalized = status.toLowerCase().replace(/\s+/g, '_')

  if (normalized === 'allocated' || normalized === 'prepared' || normalized === 'picked_up') {
    return normalized
  }

  return null
}

const getNextActionStatus = (lastStatus: ActionStage | null): ActionStage => {
  if (!lastStatus) return 'allocated'
  if (lastStatus === 'allocated') return 'prepared'
  if (lastStatus === 'prepared') return 'picked_up'

  return 'picked_up'
}

const AddInventoryJobActionModal = ({
  open,
  onOpenChange,
  materialJob,
  staffs,
  warehouses,
  businessLocations,
  onSuccess
}: AddInventoryJobActionModalProps) => {
  const purchaseUnit =
    materialJob?.product?.purchase_unit?.name ?? materialJob?.product?.purchase_uom?.name ?? 'Each(s)'

  const actions = materialJob?.actions ?? []

  const actionTotals = actions.reduce(
    (acc, action) => {
      const status = normalizeActionStatus(action.action_status)
      const qty = Number(action.quantity ?? 0)

      if (!status || Number.isNaN(qty) || qty <= 0) return acc

      acc[status] += qty

      return acc
    },
    { allocated: 0, prepared: 0, picked_up: 0 }
  )

  const getLatestActionStatus = (): ActionStage | null => {
    if (actions.length === 0) return null

    const latest = actions.reduce((latestAction, currentAction) => {
      const latestTime = new Date(latestAction.action_date || (latestAction as any).created_at || 0).getTime()

      const currentTime = new Date(currentAction.action_date || (currentAction as any).created_at || 0).getTime()

      return currentTime > latestTime ? currentAction : latestAction
    })

    return normalizeActionStatus(latest.action_status)
  }

  const defaultActionStatus = getNextActionStatus(getLatestActionStatus())
  const jobQuantity = Number(materialJob?.purchase_quantity ?? 0)

  const getAllowedQuantityForStatus = (statusValue?: string): number => {
    const status = normalizeActionStatus(statusValue)

    if (!status) return 0

    if (status === 'allocated') {
      return mathRoundFixed(Math.max(0, jobQuantity - actionTotals.allocated), 4)
    }

    if (status === 'prepared') {
      return mathRoundFixed(Math.max(0, actionTotals.allocated - actionTotals.prepared), 4)
    }

    return mathRoundFixed(Math.max(0, actionTotals.prepared - actionTotals.picked_up), 4)
  }

  const defaultQuantity = getAllowedQuantityForStatus(defaultActionStatus)

  const form = useForm<FormValues>({
    defaultValues: {
      action_status: defaultActionStatus,
      action_date: new Date(),
      employee_id: materialJob?.sale_representative?.id ?? '',
      quantity: defaultQuantity > 0 ? defaultQuantity : '',
      warehouse_type: 'warehouse',
      warehouse_id: '',
      stock_area: '',
      stock_section: '',
      location_notes: ''
    }
  })

  const warehouseType = form.watch('warehouse_type')
  const selectedActionStatus = form.watch('action_status')
  const maxAllowedQuantity = getAllowedQuantityForStatus(selectedActionStatus)

  useEffect(() => {
    if (open) {
      const nextDefaultStatus = getNextActionStatus(getLatestActionStatus())
      const nextDefaultQuantity = getAllowedQuantityForStatus(nextDefaultStatus)

      form.reset({
        action_status: nextDefaultStatus,
        action_date: new Date(),
        employee_id: materialJob?.sale_representative?.id ?? '',
        quantity: nextDefaultQuantity > 0 ? nextDefaultQuantity : '',
        warehouse_type: 'warehouse',
        warehouse_id: '',
        stock_area: '',
        stock_section: '',
        location_notes: ''
      })
    }
  }, [open, materialJob])

  // Reset warehouse_id when warehouse_type changes
  useEffect(() => {
    form.setValue('warehouse_id', '')
  }, [warehouseType])

  useEffect(() => {
    const currentQuantity = Number(form.getValues('quantity'))

    if (Number.isNaN(currentQuantity)) return

    if (maxAllowedQuantity <= 0) {
      form.setValue('quantity', '', { shouldValidate: true })

      return
    }

    if (currentQuantity > maxAllowedQuantity) {
      form.setValue('quantity', maxAllowedQuantity, { shouldValidate: true })
    }
  }, [selectedActionStatus, maxAllowedQuantity])

  const onSubmit = async (values: FormValues) => {
    if (!materialJob) return

    const quantity = Number(values.quantity)
    const allowedQuantity = getAllowedQuantityForStatus(values.action_status)

    if (Number.isNaN(quantity) || quantity <= 0) {
      toast.error('Quantity must be greater than 0')

      return
    }

    if (quantity > allowedQuantity) {
      toast.error(`Quantity cannot be greater than ${allowedQuantity} ${purchaseUnit}`)

      return
    }

    const payload: MaterialJobActionPayload = {
      action_status: values.action_status,
      quantity: mathRoundFixed(quantity * (materialJob?.product?.coverage_per_rate ?? 1), 4),
      action_date: values.action_date ? format(values.action_date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      employee_id: values.employee_id,
      vendor_id: materialJob.vendor_id ?? '',
      warehouse_type: values.warehouse_type,
      warehouse_id: values.warehouse_id,
      stock_area: values.stock_area || undefined,
      stock_section: values.stock_section || undefined,
      location_notes: values.location_notes || undefined
    }

    try {
      await MaterialJobService.storeAction(materialJob.id, payload)
      toast.success('Action added successfully')
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      if (error?.errors && typeof error.errors === 'object') {
        Object.values(error.errors).forEach((errMsg: any) => {
          errMsg?.forEach((msg: string) => toast.error(msg))
        })
      } else {
        toast.error(error?.message || 'Something went wrong')
      }
    }
  }

  const onCancel = () => {
    onOpenChange(false)
    form.reset()
  }

  const displayField = (label: string, value: string | number | null | undefined) => (
    <div className='flex flex-col gap-1'>
      <span className='text-xs text-muted-foreground'>{label}</span>
      <span className='text-sm font-medium rounded-md px-3 py-2 bg-white/5 min-h-9'>{value ?? '—'}</span>
    </div>
  )

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Manage Inventory Product Tracking'
      description=''
      maxWidth='3xl'
      isLoading={form.formState.isSubmitting}
      loadingMessage='Saving action...'
      disableClose={form.formState.isSubmitting}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={form.formState.isSubmitting}>
            Cancel
          </Button>
          <Button type='submit' form='inventory-action-form' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id='inventory-action-form' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Left column */}
            <div className='space-y-4'>
              {/* Action Status */}
              <FormField
                control={form.control}
                name='action_status'
                rules={{ required: 'Action is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Action <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={form.formState.isSubmitting}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select action' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTION_STATUS_OPTIONS.map(opt => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            disabled={getAllowedQuantityForStatus(opt.value) <= 0}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Date */}
              <FormField
                control={form.control}
                name='action_date'
                rules={{ required: 'Action date is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Action Date <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} placeholder='Select date' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Employee */}
              <FormField
                control={form.control}
                name='employee_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={form.formState.isSubmitting}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select employee' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffs.map(staff => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {[staff.first_name, staff.last_name].filter(Boolean).join(' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comment */}
              <FormField
                control={form.control}
                name='location_notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter comment...'
                        className='resize-none min-h-[100px]'
                        {...field}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right column */}
            <div className='space-y-4'>
              {/* Quantity */}
              <FormField
                control={form.control}
                name='quantity'
                rules={{
                  required: 'Quantity is required',
                  min: { value: 0.01, message: 'Quantity must be greater than 0' },
                  validate: value => {
                    const numericValue = Number(value)

                    if (Number.isNaN(numericValue)) return 'Quantity is required'
                    if (numericValue <= 0) return 'Quantity must be greater than 0'

                    if (numericValue > maxAllowedQuantity) {
                      return `Quantity cannot be greater than ${maxAllowedQuantity} ${purchaseUnit}`
                    }

                    return true
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Quantity <span className='text-destructive'>*</span>
                    </FormLabel>
                    <div className='flex items-center gap-2'>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          step='any'
                          placeholder='0'
                          {...field}
                          disabled={form.formState.isSubmitting}
                          className='flex-1'
                        />
                      </FormControl>
                      <span className='text-sm text-muted-foreground whitespace-nowrap px-3 py-2 bg-muted rounded-md min-w-16 text-center'>
                        {purchaseUnit}
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Warehouse Type */}
              <FormField
                control={form.control}
                name='warehouse_type'
                rules={{ required: 'Warehouse type is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Warehouse Type <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={form.formState.isSubmitting}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='warehouse'>Warehouse</SelectItem>
                        <SelectItem value='location'>Location</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Warehouse / Location */}
              <FormField
                control={form.control}
                name='warehouse_id'
                rules={{ required: 'Warehouse is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {warehouseType === 'warehouse' ? 'Warehouse' : 'Location'}{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={form.formState.isSubmitting}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue
                            placeholder={warehouseType === 'warehouse' ? 'Select warehouse' : 'Select location'}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouseType === 'warehouse'
                          ? warehouses.map(w => (
                              <SelectItem key={w.id} value={w.id}>
                                {w.title}
                              </SelectItem>
                            ))
                          : businessLocations.map(bl => (
                              <SelectItem key={bl.id} value={bl.id}>
                                {bl.name}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Max Quantity (read-only) */}
              {displayField(
                'Max Allowed Quantity',
                `${maxAllowedQuantity} ${purchaseUnit} (${selectedActionStatus?.replace('_', ' ') || 'action'})`
              )}

              {/* Stock Area & Stock Section */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 '>
                <FormField
                  control={form.control}
                  name='stock_area'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Area</FormLabel>
                      <FormControl>
                        <Input placeholder='Stock area' {...field} disabled={form.formState.isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='stock_section'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Section</FormLabel>
                      <FormControl>
                        <Input placeholder='Stock section' {...field} disabled={form.formState.isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default AddInventoryJobActionModal
