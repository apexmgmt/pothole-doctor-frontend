'use client'

import { useEffect, useState, useMemo } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

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

  return (
    <CommonDialog
      isLoading={form.formState.isSubmitting}
      loadingMessage='Loading labor cost...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create Labor Cost' : 'Edit Labor Cost'}
      description={mode === 'create' ? 'Add a new labor cost' : 'Update labor cost information'}
      maxWidth='2xl'
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
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* Name */}
          <FormField
            control={form.control}
            name='name'
            rules={{
              required: 'Labor name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Labor Name <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter labor cost name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Labor Description</FormLabel>
                <FormControl>
                  <Textarea placeholder='Enter description' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cost, Price, Margin in one line for large screens */}
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
            {/* Cost */}
            <FormField
              control={form.control}
              name='cost'
              rules={{
                required: 'Cost is required',
                min: { value: 0, message: 'Cost must be at least 0' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Cost <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      step={0.01}
                      placeholder='0.00'
                      {...field}
                      onChange={e => {
                        const cost = Number(e.target.value)

                        field.onChange(cost)

                        const margin = form.getValues('margin')

                        form.setValue('price', getSellPrice(cost, margin), { shouldValidate: true })
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Margin */}
            <FormField
              control={form.control}
              name='margin'
              rules={{
                required: 'Margin is required',
                min: { value: 0, message: 'Margin must be at least 0' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Margin <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      step={0.01}
                      placeholder='0.00'
                      {...field}
                      onChange={e => {
                        const margin = Number(e.target.value)

                        field.onChange(margin)

                        const cost = form.getValues('cost')

                        form.setValue('price', getSellPrice(cost, margin), { shouldValidate: true })
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Price */}
            <FormField
              control={form.control}
              name='price'
              rules={{
                required: 'Price is required',
                min: { value: 0, message: 'Price must be at least 0' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Price <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      step={0.01}
                      placeholder='0.00'
                      {...field}
                      onChange={e => {
                        const price = Number(e.target.value)

                        field.onChange(price)

                        const cost = form.getValues('cost')

                        form.setValue('margin', getMargin(cost, price), { shouldValidate: true })
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Service Type & Unit Group & Unit in one line for large screens, two lines for small screens */}
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
            {/* Service Type */}
            <FormField
              control={form.control}
              name='service_type_id'
              rules={{
                required: 'Service type is required'
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Service Type <span className='text-red-500'>*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select service type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceTypes.map(serviceType => (
                        <SelectItem key={serviceType.id} value={serviceType.id}>
                          {serviceType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unit Group Type (not in payload) */}
            <FormItem>
              <FormLabel>
                Unit Type <span className='text-red-500'>*</span>
              </FormLabel>
              <Select value={unitGroup} onValueChange={setUnitGroup}>
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select unit type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='uom'>UOM</SelectItem>
                  <SelectItem value='measure'>Measure</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>

            {/* Unit */}
            <FormField
              control={form.control}
              name='unit_id'
              rules={{
                required: 'Unit is required'
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Unit <span className='text-red-500'>*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select unit' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredUnits.map(unit => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditLaborCostModal
