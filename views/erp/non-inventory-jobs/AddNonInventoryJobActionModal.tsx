'use client'

import { useEffect, useState } from 'react'

import { Path, RegisterOptions, useForm } from 'react-hook-form'

import { toast } from 'sonner'
import { format } from 'date-fns'

import { BusinessLocation, MaterialJob, MaterialJobActionPayload, Staff, Warehouse } from '@/types'
import { VendorPickupAddress } from '@/types/vendors'
import { ClientAddress } from '@/types/clients/clients_addresses'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import MaterialJobService from '@/services/api/products/material-jobs.service'
import VendorPickupAddressService from '@/services/api/vendors/vendor-pickup-addresses.service'
import ClientAddressService from '@/services/api/clients/client-addresses.service'
import { InputType, SelectOption } from '@/components/form/fields/types'
import CustomFormField from '@/components/form/CustomFormField'
import { mathRoundFixed } from '@/utils/utility'

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

type ActionStage = 'shipped_from_vendor' | 'received' | 'prepared' | 'picked_up' | 'shipped'

type FormFieldType = {
  name: Path<FormValues>
  type?: InputType
  label?: string
  placeholder?: string
  description?: string
  rules?: RegisterOptions<FormValues, Path<FormValues>>
  selectOptions?: SelectOption[]
  onChange?: (value: any) => void
  disabled?: boolean
}

const ACTION_STATUS_OPTIONS = [
  { value: 'shipped_from_vendor', label: 'Shipped From Vendor' },
  { value: 'received', label: 'Received' },
  { value: 'prepared', label: 'Prepared' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'shipped', label: 'Shipped' }
]

const normalizeActionStatus = (status?: string | null): ActionStage | null => {
  if (!status) return null

  const normalized = status.toLowerCase().replace(/\s+/g, '_')

  if (
    normalized === 'shipped_from_vendor' ||
    normalized === 'received' ||
    normalized === 'prepared' ||
    normalized === 'picked_up' ||
    normalized === 'shipped'
  ) {
    return normalized as ActionStage
  }

  return null
}

const getNextActionStatus = (lastStatus: ActionStage | null): ActionStage => {
  if (!lastStatus) return 'shipped_from_vendor'
  if (lastStatus === 'shipped_from_vendor') return 'received'
  if (lastStatus === 'received') return 'prepared'
  if (lastStatus === 'prepared') return 'picked_up'
  if (lastStatus === 'picked_up') return 'shipped'

  return 'shipped'
}

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

  const maxQuantity = materialJob?.purchase_quantity ?? materialJob?.quantity ?? 0

  const [vendorAddresses, setVendorAddresses] = useState<VendorPickupAddress[]>([])
  const [clientAddresses, setClientAddresses] = useState<ClientAddress[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)

  const actions = materialJob?.actions ?? []

  const actionTotals = actions.reduce(
    (acc, action) => {
      const status = normalizeActionStatus(action.action_status)
      const qty = Number(action.quantity ?? 0)

      if (!status || Number.isNaN(qty) || qty <= 0) return acc

      acc[status] += qty

      return acc
    },
    { shipped_from_vendor: 0, received: 0, prepared: 0, picked_up: 0, shipped: 0 }
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
  const jobQuantity = Number(materialJob?.purchase_quantity ?? materialJob?.quantity ?? 0)

  const getAllowedQuantityForStatus = (statusValue?: string): number => {
    const status = normalizeActionStatus(statusValue)

    if (!status) return 0

    if (status === 'shipped_from_vendor') {
      return mathRoundFixed(Math.max(0, jobQuantity - actionTotals.shipped_from_vendor), 4)
    }

    if (status === 'received') {
      return mathRoundFixed(Math.max(0, actionTotals.shipped_from_vendor - actionTotals.received), 4)
    }

    if (status === 'prepared') {
      return mathRoundFixed(Math.max(0, actionTotals.received - actionTotals.prepared), 4)
    }

    if (status === 'picked_up') {
      return mathRoundFixed(Math.max(0, actionTotals.prepared - actionTotals.picked_up), 4)
    }

    return mathRoundFixed(Math.max(0, actionTotals.picked_up - actionTotals.shipped), 4)
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
      location_notes: ''
    }
  })

  const {
    watch,
    setValue,
    control,
    register,
    formState: { errors }
  } = form

  const warehouseType = watch('warehouse_type')
  const selectedActionStatus = watch('action_status')
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
        location_notes: ''
      })
      setVendorAddresses([])
      setClientAddresses([])
    }
  }, [open, materialJob])

  // Reset warehouse_id when warehouse_type changes
  useEffect(() => {
    setValue('warehouse_id', '')

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

  useEffect(() => {
    const currentQuantity = Number(form.getValues('quantity'))

    if (Number.isNaN(currentQuantity)) return

    if (maxAllowedQuantity <= 0) {
      setValue('quantity', '', { shouldValidate: true })

      return
    }

    if (currentQuantity > maxAllowedQuantity) {
      setValue('quantity', maxAllowedQuantity, { shouldValidate: true })
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
      quantity: mathRoundFixed(
        quantity *
          (materialJob?.product?.purchase_uom_id === materialJob?.product?.selling_unit_id
            ? 1
            : (materialJob?.product?.coverage_per_rate ?? 1)),
        4
      ),
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

  const getLocationOptions = (): SelectOption[] => {
    switch (warehouseType) {
      case 'warehouse':
        return warehouses.map(w => ({ value: w.id, label: w.title }))
      case 'location':
        return businessLocations.map(bl => ({ value: bl.id, label: bl.name }))
      case 'vendor_address':
        return vendorAddresses.map(addr => ({
          value: addr.id,
          label: `${addr.title} ${addr.street_address ? `— ${addr.street_address}` : ''}`
        }))
      case 'job_site':
        return clientAddresses.map(addr => ({
          value: addr.id,
          label: `${addr.title} ${addr.street_address ? `— ${addr.street_address}` : ''}`
        }))
    }
  }

  const leftFields: FormFieldType[] = [
    {
      name: 'action_status',
      type: 'select',
      label: 'Action',
      placeholder: 'Select action',
      rules: { required: 'Action is required' },
      selectOptions: ACTION_STATUS_OPTIONS.map(opt => ({
        ...opt,
        disabled: getAllowedQuantityForStatus(opt.value) <= 0
      }))
    },
    {
      name: 'action_date',
      type: 'datepicker',
      label: 'Action Date',
      placeholder: 'Select date',
      rules: { required: 'Action date is required' }
    },
    {
      name: 'employee_id',
      type: 'select',
      label: 'Employee',
      placeholder: 'Select employee',
      selectOptions: staffs.map(staff => ({
        value: staff.id,
        label: [staff.first_name, staff.last_name].filter(Boolean).join(' ')
      }))
    },
    {
      name: 'location_notes',
      type: 'textarea',
      label: 'Comment',
      placeholder: 'Enter comment...'
    }
  ]

  const rightFields: FormFieldType[] = [
    {
      name: 'quantity',
      type: 'number',
      label: `Qty (${purchaseUnit})`,
      placeholder: '0',
      description: `Max Qty: ${maxAllowedQuantity} ${purchaseUnit} (${selectedActionStatus?.replace(/_/g, ' ') || 'action'})`,
      rules: {
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
      }
    },
    {
      name: 'warehouse_type',
      type: 'select',
      label: 'Location Type',
      placeholder: 'Select location type',
      rules: { required: 'Location type is required' },
      selectOptions: LOCATION_TYPE_OPTIONS
    },
    {
      name: 'warehouse_id',
      type: 'select',
      label: getLocationLabel(),
      placeholder: getLocationPlaceholder(),
      rules: { required: `${getLocationLabel()} is required` },
      selectOptions: getLocationOptions(),
      disabled: isLoadingAddresses
    }
  ]

  const sharedFieldClass = 'grid grid-cols-[100px_minmax(0,_1fr)]'
  const sharedLabelClass = 'justify-end items-start self-start text-right pt-1'

  const renderFormField = (field: FormFieldType) => {
    return (
      <CustomFormField
        key={field.name}
        {...field}
        register={register}
        control={control}
        errors={errors}
        fieldClassName={sharedFieldClass}
        labelClassName={sharedLabelClass}
      />
    )
  }

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Manage Non-Inventory Product Tracking'
      className='sm:max-w-300'
      isLoading={form.formState.isSubmitting}
      loadingMessage='Saving action...'
      disableClose={form.formState.isSubmitting || isLoadingAddresses}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' size='sm' onClick={onCancel} disabled={form.formState.isSubmitting}>
            Cancel
          </Button>
          <Button type='submit' size='sm' form='non-inventory-action-form' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id='non-inventory-action-form' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Left column */}
            <div className='flex flex-col gap-y-2'>{leftFields.map(renderFormField)}</div>

            {/* Right column */}
            <div className='flex flex-col gap-y-2'>
              {rightFields.map(renderFormField)}
            </div>
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default AddNonInventoryJobActionModal

