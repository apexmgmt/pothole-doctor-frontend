'use client'

import { Path, RegisterOptions, UseFormReturn } from 'react-hook-form'

import { BusinessLocation, Courier, Warehouse } from '@/types'
import { InputType, SelectOption } from '@/components/form/fields/types'
import type { FormValues } from './types'
import CustomFormField from '@/components/form/CustomFormField'

interface OrderDetailsFormProps {
  form: UseFormReturn<FormValues>
  mode: 'create' | 'edit'
  couriers: Courier[]
  warehouses: Warehouse[]
  businessLocations: BusinessLocation[]
}

type FormFieldType = {
  name: Path<FormValues>
  type?: InputType
  label?: string
  placeholder?: string
  rules?: RegisterOptions<FormValues, Path<FormValues>>
  selectOptions?: SelectOption[]
  onChange?: (value: any) => void
  fieldClassName?: string
  key?: string
}

const OrderDetailsForm = ({ form, mode, couriers, warehouses, businessLocations }: OrderDetailsFormProps) => {
  const {
    watch,
    setValue,
    control,
    register,
    formState: { errors }
  } = form

  const warehouseType = watch('warehouse_type')

  const fields: FormFieldType[] = [
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      placeholder: 'Select Status',
      rules:
        mode === 'create'
          ? {}
          : {
              required: 'Status is required',
              validate: value => (value === 'new' ? `Status can't be changed to new` : true)
            },
      selectOptions: [
        { value: 'new', label: 'New' },
        { value: 'pending', label: 'Pending' },
        { value: 'ordered', label: 'Ordered' }
      ]
    },
    {
      name: 'courier_id',
      type: 'select',
      label: 'Carrier',
      placeholder: 'Select Carrier',
      selectOptions: couriers.map(c => ({
        value: c.id,
        label: c.name
      }))
    },
    {
      name: 'reference_number',
      type: 'text',
      label: 'Reference Number',
      placeholder: 'Reference Number'
    },
    {
      name: 'est_departure_date',
      type: 'datepicker',
      label: 'Est. Departure',
      placeholder: 'Est. Departure'
    },
    {
      name: 'est_arrival_date',
      type: 'datepicker',
      label: 'Est. Arrival',
      placeholder: 'Est. Arrival'
    },
    {
      name: 'est_shipping_cost',
      type: 'number',
      label: 'Est. Shipping Cost',
      placeholder: '0.00'
    },
    {
      name: 'warehouse_type',
      type: 'select',
      label: 'Warehouse Type',
      placeholder: 'Select Type',
      rules: { required: 'Warehouse type is required' },
      selectOptions: [
        { value: 'warehouse', label: 'Warehouse' },
        { value: 'location', label: 'Location' }
      ],
      onChange: () => {
        setValue('warehouse_id', '')
      }
    },
    {
      name: 'warehouse_id',
      type: 'select',
      label: 'Warehouse',
      placeholder: warehouseType === 'warehouse' ? 'Select Warehouse' : 'Select Location',
      rules: { required: 'Warehouse is required' },
      selectOptions:
        warehouseType === 'warehouse'
          ? warehouses.map(w => ({ value: w.id, label: w.title }))
          : businessLocations.map(l => ({ value: l.id, label: l.name })),
      key: `warehouse_id-${warehouseType}`
    },
    {
      name: 'payment_due',
      type: 'select',
      label: 'Payment Due',
      placeholder: 'Select Payment Type',
      selectOptions: [
        { value: 'on_arrival', label: 'On Arrival' },
        { value: 'paid', label: 'Paid' }
      ]
    },
    {
      name: 'comments',
      type: 'textarea',
      label: 'Comments',
      placeholder: 'Comments...',
      fieldClassName: 'sm:col-span-2 lg:col-span-3'
    }
  ]

  const sharedFieldClass = 'grid grid-cols-[116px_minmax(0,_1fr)]'
  const sharedLabelClass = 'justify-end items-start self-start text-right pt-1'

  const renderFormField = (field: FormFieldType) => {
    return (
      <CustomFormField
        key={field.key || field.name}
        {...field}
        register={register}
        control={control}
        errors={errors}
        fieldClassName={`${sharedFieldClass} ${field.fieldClassName || ''}`}
        labelClassName={sharedLabelClass}
      />
    )
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border border-border rounded-lg'>
      {fields.map(renderFormField)}
    </div>
  )
}

export default OrderDetailsForm
