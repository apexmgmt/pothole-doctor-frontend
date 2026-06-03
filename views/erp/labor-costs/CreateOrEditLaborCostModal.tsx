'use client'

import { useEffect, useState, useMemo } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import CustomFormField from '@/components/form/CustomFormField'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import LaborCostService from '@/services/api/labor_costs.service'
import { LaborCost, LaborCostPayload, ServiceType, Unit } from '@/types'
import { getSellPrice, getMargin } from '@/utils/business-calculation'

interface CreateOrEditLaborCostModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceTypes: ServiceType[]
  units: Unit[]
  laborCostId?: string
  laborCostDetails?: LaborCost
  onSuccess?: () => void
}

interface FormValues {
  name: string
  description: string
  cost: number
  price: number
  margin: number
  service_type_id: string
  unit_id: string
}

const CreateOrEditLaborCostModal = ({
  mode = 'create',
  open,
  onOpenChange,
  serviceTypes,
  units,
  laborCostId,
  laborCostDetails,
  onSuccess
}: CreateOrEditLaborCostModalProps) => {
  const form = useForm<FormValues>({
    defaultValues: {
      name: laborCostDetails?.name || '',
      description: laborCostDetails?.description || '',
      cost: laborCostDetails?.cost || 0,
      price: laborCostDetails?.price || 0,
      margin: laborCostDetails?.margin || 0,
      service_type_id: laborCostDetails?.service_type_id || '',
      unit_id: laborCostDetails?.unit_id || ''
    }
  })

  // Reset form when laborCostDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: laborCostDetails?.name || '',
        description: laborCostDetails?.description || '',
        cost: laborCostDetails?.cost || 0,
        price: laborCostDetails?.price || 0,
        margin: laborCostDetails?.margin || 0,
        service_type_id: laborCostDetails?.service_type_id || '',
        unit_id: laborCostDetails?.unit_id || ''
      })
    }
  }, [laborCostDetails, open, form])

  // Add state for unit group selection
  const [unitGroup, setUnitGroup] = useState<string>('uom')

  // Memoized filtered units based on selected group
  const filteredUnits = useMemo(() => units.filter(unit => unit.group === unitGroup), [units, unitGroup])

  const handleApiError = (error: any, fallbackMessage: string) => {
    if (error?.errors && typeof error.errors === 'object') {
      Object.entries(error.errors).forEach(([field, messages]) => {
        const msg = Array.isArray(messages) ? messages[0] : String(messages)

        form.setError(field as keyof FormValues, { type: 'server', message: msg })
      })

      if (error.message) {
        toast.error(error.message)
      }
    } else {
      toast.error(typeof error.message === 'string' ? error.message : fallbackMessage)
    }
  }

  const onSubmit = async (values: FormValues) => {
    const payload: LaborCostPayload = {
      name: values.name,
      description: values.description,
      cost: Number(values.cost),
      price: Number(values.price),
      margin: Number(values.margin),
      service_type_id: values.service_type_id,
      unit_id: values.unit_id
    }

    if (mode === 'create') {
      try {
        await LaborCostService.store(payload)
          .then(() => {
            toast.success('Labor cost created successfully')
            onOpenChange(false)
            onSuccess?.()
            form.reset()
          })
          .catch(error => handleApiError(error, 'Failed to create labor cost'))
      } catch {
        toast.error('Something went wrong while creating the labor cost!')
      }
    } else if (mode === 'edit' && laborCostId) {
      try {
        await LaborCostService.update(laborCostId, payload)
          .then(() => {
            toast.success('Labor cost updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => handleApiError(error, 'Failed to update labor cost'))
      } catch {
        toast.error('Something went wrong while updating the labor cost!')
      }
    }
  }

  const onCancel = () => {
    form.reset({
      name: laborCostDetails?.name || '',
      description: laborCostDetails?.description || '',
      cost: laborCostDetails?.cost || 0,
      price: laborCostDetails?.price || 0,
      margin: laborCostDetails?.margin || 0,
      service_type_id: laborCostDetails?.service_type_id || '',
      unit_id: laborCostDetails?.unit_id || ''
    })
    onOpenChange(false)
  }

  const fieldStyle = 'grid grid-cols-[152px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  const {
    register,
    control,
    setValue,
    formState: { errors }
  } = form

  return (
    <CommonDialog
      isLoading={form.formState.isSubmitting}
      loadingMessage='Loading labor cost...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create Labor Cost' : 'Edit Labor Cost'}
      description={mode === 'create' ? 'Add a new labor cost' : 'Update labor cost information'}
      maxWidth='5xl'
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
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
          {/* Name */}
          <div className='grid grid-cols-1 gap-x-4 gap-y-2'>
            <CustomFormField
              name='name'
              label='Labor Name'
              placeholder='Enter labor cost name'
              rules={{
                required: 'Labor name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              }}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />
          </div>

          {/* Description */}
          <div className='grid grid-cols-1 gap-x-4 gap-y-2'>
            <CustomFormField
              name='description'
              label='Labor Description'
              type='textarea'
              placeholder='Enter description'
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />
          </div>

          {/* Cost, Price, Margin in one line for large screens */}
          <div className='grid grid-cols-1 gap-x-4 gap-y-2 lg:grid-cols-3'>
            {/* Cost */}
            <CustomFormField
              name='cost'
              label='Cost'
              type='number'
              placeholder='0.00'
              rules={{
                required: 'Cost is required',
                min: { value: 0, message: 'Cost must be at least 0' }
              }}
              onChange={value => {
                const cost = Number(value)
                const margin = form.getValues('margin')

                setValue('cost', cost, { shouldValidate: true })
                setValue('price', getSellPrice(cost, margin), { shouldValidate: true })
              }}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            {/* Margin */}
            <CustomFormField
              name='margin'
              label='Margin'
              type='number'
              placeholder='0.00'
              rules={{
                required: 'Margin is required',
                min: { value: 0, message: 'Margin must be at least 0' },
                max: { value: 100, message: 'Margin cannot be more than 100' }
              }}
              onChange={value => {
                const margin = Number(value)
                const cost = form.getValues('cost')

                setValue('margin', margin, { shouldValidate: true })
                setValue('price', getSellPrice(cost, margin), { shouldValidate: true })
              }}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            {/* Price */}
            <CustomFormField
              name='price'
              label='Price'
              type='number'
              placeholder='0.00'
              rules={{
                required: 'Price is required',
                min: { value: 0, message: 'Price must be at least 0' }
              }}
              onChange={value => {
                const price = Number(value)
                const cost = form.getValues('cost')

                setValue('price', price, { shouldValidate: true })
                setValue('margin', getMargin(cost, price), { shouldValidate: true })
              }}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />
          </div>

          {/* Service Type & Unit Group & Unit in one line for large screens, two lines for small screens */}
          <div className='grid grid-cols-1 gap-x-4 gap-y-2 lg:grid-cols-[3fr_2fr_2fr]'>
            {/* Service Type */}
            <CustomFormField
              name='service_type_id'
              label='Service Type'
              type='select'
              placeholder='Select service type'
              rules={{
                required: 'Service type is required'
              }}
              selectOptions={serviceTypes.map(serviceType => ({
                value: serviceType.id,
                label: serviceType.name
              }))}
              control={control}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            {/* Unit Group Type (not in payload) */}
            <CustomFormField
              type='select'
              name='unit_group_type'
              label='Unit Type'
              placeholder='Select unit type'
              selectOptions={[
                { value: 'uom', label: 'UOM' },
                { value: 'measure', label: 'Measure' }
              ]}
              value={unitGroup}
              onChange={value => setUnitGroup(String(value))}
              fieldClassName={`${fieldStyle} lg:grid-cols-[62px_minmax(0,_1fr)]!`}
              labelClassName={labelStyle}
            />

            {/* Unit */}
            <CustomFormField
              name='unit_id'
              label='Unit'
              type='select'
              placeholder='Select unit'
              rules={{
                required: 'Unit is required'
              }}
              selectOptions={filteredUnits.map(unit => ({
                value: unit.id,
                label: unit.name
              }))}
              control={control}
              errors={errors}
              fieldClassName={`${fieldStyle} lg:grid-cols-[105px_minmax(0,_1fr)]!`}
              labelClassName={labelStyle}
            />
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditLaborCostModal
