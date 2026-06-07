'use client'

import { useEffect, ReactNode } from 'react'
import { Path, RegisterOptions, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { BusinessLocation, MaterialJob, MaterialJobActionPayload, Staff, Warehouse } from '@/types'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import MaterialJobService from '@/services/api/products/material-jobs.service'
import { mathRoundFixed } from '@/utils/utility'
import { InputType, SelectOption } from '@/components/form/fields/types'
import CustomFormField from '@/components/form/CustomFormField'

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

type FormFieldType = {
  name: Path<FormValues>
  type?: InputType
  label?: string
  placeholder?: string
  description?: string
  rules?: RegisterOptions<FormValues, Path<FormValues>>
  selectOptions?: SelectOption[]
  onChange?: (value: any) => void
}

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
        stock_area: '',
        stock_section: '',
        location_notes: ''
      })
    }
  }, [open, materialJob])

  // Reset warehouse_id when warehouse_type changes
  useEffect(() => {
    setValue('warehouse_id', '')
  }, [warehouseType])

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

  const leftFields: FormFieldType[] = [
    {
      name: 'action_status',
      type: 'select',
      label: 'Action',
      placeholder: 'Select action',
      rules: { required: 'Action is required' },
      selectOptions: ACTION_STATUS_OPTIONS.map(opt => ({
        value: opt.value,
        label: opt.label,
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
      description: `Max Qty: ${maxAllowedQuantity} ${purchaseUnit} (${selectedActionStatus?.replace('_', ' ') || 'action'})`,
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
      label: 'Type',
      placeholder: 'Select type',
      rules: { required: 'Warehouse type is required' },
      selectOptions: [
        { value: 'warehouse', label: 'Warehouse' },
        { value: 'location', label: 'Location' }
      ]
    },
    {
      name: 'warehouse_id',
      type: 'select',
      label: warehouseType === 'warehouse' ? 'Warehouse' : 'Location',
      placeholder: warehouseType === 'warehouse' ? 'Select warehouse' : 'Select location',
      rules: { required: 'Warehouse is required' },
      selectOptions:
        warehouseType === 'warehouse'
          ? warehouses.map(w => ({ value: w.id, label: w.title }))
          : businessLocations.map(bl => ({ value: bl.id, label: bl.name }))
    }
  ]

  const stockFields: FormFieldType[] = [
    {
      name: 'stock_area',
      type: 'text',
      label: 'Stock Area',
      placeholder: 'Stock area'
    },
    {
      name: 'stock_section',
      type: 'text',
      label: 'Stock Section',
      placeholder: 'Stock section'
    }
  ]

  const sharedFieldClass = 'grid grid-cols-[84px_minmax(0,_1fr)]'
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
      title='Manage Inventory Product Tracking'
      className='sm:max-w-300'
      isLoading={form.formState.isSubmitting}
      loadingMessage='Saving action...'
      disableClose={form.formState.isSubmitting}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' size='sm' onClick={onCancel} disabled={form.formState.isSubmitting}>
            Cancel
          </Button>
          <Button type='submit' size='sm' form='inventory-action-form' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id='inventory-action-form' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Left column */}
            <div className='flex flex-col gap-y-2'>{leftFields.map(renderFormField)}</div>

            {/* Right column */}
            <div className='flex flex-col gap-y-2'>
              {rightFields.map(renderFormField)}

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>{stockFields.map(renderFormField)}</div>
            </div>
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default AddInventoryJobActionModal
