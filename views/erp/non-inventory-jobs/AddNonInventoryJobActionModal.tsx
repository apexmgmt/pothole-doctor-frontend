'use client'

import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'
import { format } from 'date-fns'

import { BusinessLocation, MaterialJob, MaterialJobActionPayload, Staff, Warehouse } from '@/types'
import { VendorPickupAddress } from '@/types/vendors'
import { ClientAddress } from '@/types/clients/clients_addresses'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/datePicker'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import MaterialJobService from '@/services/api/products/material-jobs.service'
import VendorPickupAddressService from '@/services/api/vendors/vendor-pickup-addresses.service'
import ClientAddressService from '@/services/api/clients/client-addresses.service'

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
  warehouse_type: 'warehouse' | 'location' | 'vendor_address' | 'job_site'
  warehouse_id: string
  location_notes: string
}

const ACTION_STATUS_OPTIONS = [
  { value: 'shipped_from_vendor', label: 'Shipped From Vendor' },
  { value: 'received', label: 'Received' },
  { value: 'prepared', label: 'Prepared' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'shipped', label: 'Shipped' }
]

const LOCATION_TYPE_OPTIONS = [
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'location', label: 'Location' },
  { value: 'vendor_address', label: 'Vendor Address' },
  { value: 'job_site', label: 'Job Site' }
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

  const [vendorAddresses, setVendorAddresses] = useState<VendorPickupAddress[]>([])
  const [clientAddresses, setClientAddresses] = useState<ClientAddress[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)

  const form = useForm<FormValues>({
    defaultValues: {
      action_status: '',
      action_date: new Date(),
      employee_id: materialJob?.sale_representative?.id ?? '',
      quantity: materialJob?.quantity ?? '',
      warehouse_type: 'warehouse',
      warehouse_id: '',
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
        location_notes: ''
      })
      setVendorAddresses([])
      setClientAddresses([])
    }
  }, [open, materialJob])

  useEffect(() => {
    form.setValue('warehouse_id', '')

    if (!open || !materialJob) return

    if (warehouseType === 'vendor_address' && materialJob.vendor_id) {
      setIsLoadingAddresses(true)
      VendorPickupAddressService.index({ vendor_id: materialJob.vendor_id })
        .then(res => {
          const d = res.data

          setVendorAddresses(Array.isArray(d) ? d : (d?.data ?? []))
        })
        .catch(() => toast.error('Failed to load vendor addresses'))
        .finally(() => setIsLoadingAddresses(false))
    } else if (warehouseType === 'job_site' && materialJob.client_id) {
      setIsLoadingAddresses(true)
      ClientAddressService.index({ client_id: materialJob.client_id })
        .then(res => {
          const d = res.data

          setClientAddresses(Array.isArray(d) ? d : (d?.data ?? []))
        })
        .catch(() => toast.error('Failed to load customer addresses'))
        .finally(() => setIsLoadingAddresses(false))
    }
  }, [warehouseType, open, materialJob])

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

  const getLocationLabel = () => {
    switch (warehouseType) {
      case 'warehouse':
        return 'Warehouse'
      case 'location':
        return 'Location'
      case 'vendor_address':
        return 'Vendor Address'
      case 'job_site':
        return 'Job Site Address'
    }
  }

  const getLocationPlaceholder = () => {
    switch (warehouseType) {
      case 'warehouse':
        return 'Select warehouse'
      case 'location':
        return 'Select location'
      case 'vendor_address':
        return isLoadingAddresses ? 'Loading...' : 'Select vendor address'
      case 'job_site':
        return isLoadingAddresses ? 'Loading...' : 'Select job site address'
    }
  }

  const renderLocationOptions = () => {
    switch (warehouseType) {
      case 'warehouse':
        return warehouses.map(w => (
          <SelectItem key={w.id} value={w.id}>
            {w.title}
          </SelectItem>
        ))
      case 'location':
        return businessLocations.map(bl => (
          <SelectItem key={bl.id} value={bl.id}>
            {bl.name}
          </SelectItem>
        ))
      case 'vendor_address':
        return vendorAddresses.map(addr => (
          <SelectItem key={addr.id} value={addr.id}>
            {addr.title} {addr.street_address ? `— ${addr.street_address}` : ''}
          </SelectItem>
        ))
      case 'job_site':
        return clientAddresses.map(addr => (
          <SelectItem key={addr.id} value={addr.id}>
            {addr.title} {addr.street_address ? `— ${addr.street_address}` : ''}
          </SelectItem>
        ))
    }
  }

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

              {/* Location Type */}
              <FormField
                control={form.control}
                name='warehouse_type'
                rules={{ required: 'Location type is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Location Type <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={form.formState.isSubmitting}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select location type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOCATION_TYPE_OPTIONS.map(opt => (
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

              {/* Dynamic Location Dropdown */}
              <FormField
                control={form.control}
                name='warehouse_id'
                rules={{ required: `${getLocationLabel()} is required` }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {getLocationLabel()} <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={form.formState.isSubmitting || isLoadingAddresses}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder={getLocationPlaceholder()} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>{renderLocationOptions()}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Max Quantity (read-only) */}
              {displayField(`Max Quantity to Prepare`, `${maxQuantity} ${purchaseUnit}`)}
            </div>
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default AddNonInventoryJobActionModal
