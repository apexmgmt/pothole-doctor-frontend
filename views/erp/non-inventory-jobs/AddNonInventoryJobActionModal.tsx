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

interface AddNonInventoryJobActionModalProps {
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

const ACTION_STATUS_OPTIONS = [
  { value: 'allocated', label: 'Allocated' },
  { value: 'prepared', label: 'Prepared' },
  { value: 'picked_up', label: 'Picked Up' }
]

const AddNonInventoryJobActionModal = ({
  open,
  onOpenChange,
  materialJob,
  staffs,
  warehouses,
  businessLocations,
  onSuccess
}: AddNonInventoryJobActionModalProps) => {
  const purchaseUnit =
    materialJob?.product?.purchase_unit?.name ?? materialJob?.product?.purchase_uom?.name ?? 'Each(s)'

  const maxQuantity = materialJob?.quantity ?? 0

  const form = useForm<FormValues>({
    defaultValues: {
      action_status: '',
      action_date: new Date(),
      employee_id: materialJob?.sale_representative?.id ?? '',
      quantity: materialJob?.quantity ?? '',
      warehouse_type: 'warehouse',
      warehouse_id: '',
      stock_area: '',
      stock_section: '',
      location_notes: ''
    }
  })

  const warehouseType = form.watch('warehouse_type')

  useEffect(() => {
    if (open) {
      form.reset({
        action_status: '',
        action_date: new Date(),
        employee_id: materialJob?.sale_representative?.id ?? '',
        quantity: materialJob?.quantity ?? '',
        warehouse_type: 'warehouse',
        warehouse_id: '',
        stock_area: '',
        stock_section: '',
        location_notes: ''
      })
    }
  }, [open, materialJob])

  useEffect(() => {
    form.setValue('warehouse_id', '')
  }, [warehouseType])

  const onSubmit = async (values: FormValues) => {
    if (!materialJob) return

    const payload: MaterialJobActionPayload = {
      action_status: values.action_status,
      quantity: Number(values.quantity),
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
      <span className='text-sm font-medium rounded-md px-3 py-2 bg-muted min-h-9'>{value ?? '—'}</span>
    </div>
  )

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Manage Non-Inventory Product Tracking'
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
          <Button type='submit' form='non-inventory-action-form' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id='non-inventory-action-form' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
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
                          <SelectItem key={opt.value} value={opt.value}>
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
                  min: { value: 0.01, message: 'Quantity must be greater than 0' }
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
              {displayField(`Max Quantity to Prepare`, `${maxQuantity} ${purchaseUnit}`)}

              {/* Stock Area & Stock Section */}
              <div className='grid grid-cols-2 gap-4'>
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

export default AddNonInventoryJobActionModal
