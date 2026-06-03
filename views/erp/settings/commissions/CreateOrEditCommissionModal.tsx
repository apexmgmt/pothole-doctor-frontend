'use client'

import { useEffect, useRef } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import {
  CommissionType,
  CommissionFilter,
  CommissionBase,
  Commission,
  CreateOrEditCommissionModalProps,
  CommissionPayload
} from '@/types'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import CommissionService from '@/services/api/settings/commissions.service'
import { Separator } from '@/components/ui/separator'
import CustomFormField from '@/components/form/CustomFormField'

interface FormValues {
  commission_type: string
  based_on: string
  per: string
  filter_type: string
  amount: string
  min_amount: string
  max_amount: string
  filter_percent: boolean
  commission_percent: boolean
}

const CreateOrEditCommissionModal = ({
  mode = 'create',
  open,
  onOpenChange,
  onSuccess,
  commissionTypes,
  commissionFilters,
  commissionBases,
  commissionId,
  commissionDetails
}: CreateOrEditCommissionModalProps) => {
  const skipPerResetRef = useRef(false)

  const form = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: {
      commission_type: commissionDetails?.commission_type || '',
      based_on: commissionDetails?.based_on || '',
      per: commissionDetails?.per || 'per-job',
      filter_type: commissionDetails?.filter_type || 'between',
      amount: commissionDetails?.amount.toString() || '0',
      min_amount: commissionDetails?.min_amount.toString() || '0',
      max_amount: commissionDetails?.max_amount.toString() || '0',
      filter_percent: commissionDetails?.filter_percent
        ? commissionDetails.filter_percent === 0
          ? false
          : true
        : true,
      commission_percent: commissionDetails?.commission_percent
        ? commissionDetails.commission_percent === 0
          ? false
          : true
        : true
    }
  })

  // Reset form when commissionDetails changes or modal opens
  useEffect(() => {
    if (open) {
      skipPerResetRef.current = true

      form.reset({
        commission_type: commissionDetails?.commission_type || '',
        based_on: commissionDetails?.based_on || '',
        per: commissionDetails?.per || 'per-job',
        filter_type: commissionDetails?.filter_type || 'between',
        amount: commissionDetails?.amount.toString() || '0',
        min_amount: commissionDetails?.min_amount.toString() || '0',
        max_amount: commissionDetails?.max_amount.toString() || '0',
        filter_percent: commissionDetails?.filter_percent
          ? commissionDetails.filter_percent === 0
            ? false
            : true
          : true,
        commission_percent: commissionDetails?.commission_percent
          ? commissionDetails.commission_percent === 0
            ? false
            : true
          : true
      })
    }
  }, [commissionDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    const payload: CommissionPayload = {
      commission_type: values.commission_type,
      based_on: values.based_on,
      per: values.per,
      filter_type: values.filter_type,
      amount: parseFloat(values.amount),
      min_amount: parseFloat(values.min_amount),
      max_amount: parseFloat(values.max_amount),
      filter_percent: values.filter_percent ? 1 : 0,
      commission_percent: values.commission_percent ? 1 : 0
    }

    if (mode === 'create') {
      try {
        await CommissionService.store(payload)
          .then(response => {
            toast.success('Commission created successfully')
            onOpenChange(false)
            onSuccess?.()
            form.reset()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create commission')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the commission!')
      }
    } else if (mode === 'edit' && commissionId) {
      try {
        await CommissionService.update(commissionId, payload)
          .then(response => {
            toast.success('Commission updated successfully')
            onOpenChange(false)
            onSuccess?.()
            form.reset()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update commission')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the commission!')
      }
    }
  }

  const onCancel = () => {
    form.reset({
      commission_type: commissionDetails?.commission_type || '',
      based_on: commissionDetails?.based_on || '',
      per: commissionDetails?.per || 'per-job',
      filter_type: commissionDetails?.filter_type || 'between',
      amount: commissionDetails?.amount.toString() || '0',
      min_amount: commissionDetails?.min_amount.toString() || '0',
      max_amount: commissionDetails?.max_amount.toString() || '0',
      filter_percent: commissionDetails?.filter_percent
        ? commissionDetails.filter_percent === 0
          ? false
          : true
        : true,
      commission_percent: commissionDetails?.commission_percent
        ? commissionDetails.commission_percent === 0
          ? false
          : true
        : true
    })
    onOpenChange(false)
  }

  // Watch filter_type to conditionally render fields
  const filterType = form.watch('filter_type')
  const basedOn = form.watch('based_on')

  // Reset per when based_on changes to avoid stale selection
  useEffect(() => {
    if (skipPerResetRef.current) {
      skipPerResetRef.current = false

      return
    }

    form.setValue('per', '')
  }, [basedOn, form])

  // Reset field values when they are hidden
  useEffect(() => {
    if (filterType === 'same-as-store') {
      form.setValue('min_amount', '0')
      form.setValue('max_amount', '0')
      form.setValue('amount', '0')
    } else if (filterType === 'less-than') {
      form.setValue('min_amount', '0')
    } else if (filterType === 'greater-than') {
      form.setValue('max_amount', '0')
    }
  }, [filterType, form])

  const fieldStyle = 'grid grid-cols-[152px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  const {
    register,
    control,
    formState: { errors }
  } = form

  return (
    <CommonDialog
      isLoading={form.formState.isSubmitting}
      loadingMessage='Loading commission...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Commission' : 'Edit Commission'}
      description={mode === 'create' ? 'Add a new commission to the system' : 'Update commission information'}
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
          {/* Commission Name Field */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-y-2'>
            <CustomFormField
              name='commission_type'
              label='Commission Name'
              type='select'
              placeholder='Select a commission type'
              rules={{ required: 'Please select a commission type' }}
              selectOptions={commissionTypes.map((commissionType: CommissionType) => ({
                label: commissionType.name,
                value: commissionType.slug.toString()
              }))}
              control={control}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />
          </div>
          {/* <Separator /> */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-y-2'>
            {/* Based on Field */}
            <CustomFormField
              name='based_on'
              label='Based On'
              type='select'
              placeholder='Select a based on'
              rules={{ required: 'Please select what the commission is based on' }}
              selectOptions={commissionBases.map((commissionBase: CommissionBase) => ({
                label: commissionBase.name,
                value: commissionBase.slug.toString()
              }))}
              control={control}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            {/* Per Field */}
            <CustomFormField
              name='per'
              label='Per'
              type='select'
              placeholder='Select a per'
              rules={{ required: 'Please select per option' }}
              selectOptions={
                basedOn === 'bonus-by-sales'
                  ? [
                      { label: 'Per Job', value: 'per-job' },
                      { label: 'Per Store Sales', value: 'per-store-sales' },
                      { label: 'Per Company Sales', value: 'per-company-sales' }
                    ]
                  : [{ label: 'Per Job', value: 'per-job' }]
              }
              control={control}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />
          </div>
          <Separator />

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-y-2'>
            {/* Filter Field */}
            <CustomFormField
              name='filter_type'
              label='Filter'
              type='select'
              placeholder='Select a filter type'
              rules={{ required: 'Please select a filter type' }}
              selectOptions={commissionFilters.map((commissionFilter: CommissionFilter) => ({
                label: commissionFilter.type,
                value: commissionFilter.slug.toString()
              }))}
              control={control}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />
            {filterType !== 'same-as-store' && (
              <div className='lg:col-span-2 flex flex-row gap-2'>
                {/* Min amount field - shown for 'between' and 'greater-than' */}
                {(filterType === 'between' || filterType === 'greater-than') && (
                  <CustomFormField
                    name='min_amount'
                    label='Min Amount'
                    type='number'
                    placeholder='Enter min amount'
                    rules={{
                      validate: value => {
                        if (form.getValues('filter_percent') && typeof value === 'string' && parseFloat(value) > 100)
                          return 'Min amount cannot be greater than 100 when using percentage'

                        return true
                      }
                    }}
                    register={register}
                    errors={errors}
                    fieldClassName={`${fieldStyle} lg:grid-cols-[96px_minmax(0,_1fr)]! flex-1`}
                    labelClassName={`${labelStyle}`}
                  />
                )}

                {/* Max amount field - shown for 'between' and 'less-than' */}
                {(filterType === 'between' || filterType === 'less-than') && (
                  <CustomFormField
                    name='max_amount'
                    label='Max Amount'
                    type='number'
                    placeholder='Enter max amount'
                    rules={{
                      validate: value => {
                        if (form.getValues('filter_percent') && typeof value === 'string' && parseFloat(value) > 100)
                          return 'Max amount cannot be greater than 100 when using percentage'

                        return true
                      }
                    }}
                    register={register}
                    errors={errors}
                    fieldClassName={`${fieldStyle} lg:grid-cols-[96px_minmax(0,_1fr)]! flex-1`}
                    labelClassName={`${labelStyle}`}
                  />
                )}

                {/* Filter percent field - shown for all except 'same-as-store' */}
                <FormField
                  control={control}
                  name='filter_percent'
                  render={({ field }) => (
                    <FormItem>
                      {/* <FormLabel className='opacity-0 pointer-events-none'>Action</FormLabel> */}
                      <FormControl>
                        <div className='flex gap-1'>
                          <Button
                            type='button'
                            variant={!field.value ? 'default' : 'outline'}
                            size='icon'
                            onClick={() => field.onChange(false)}
                            className='h-7 w-7'
                          >
                            $
                          </Button>
                          <Button
                            type='button'
                            variant={field.value ? 'default' : 'outline'}
                            size='icon'
                            onClick={() => field.onChange(true)}
                            className='h-7 w-7'
                          >
                            %
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
          <Separator />

          {filterType !== 'same-as-store' && (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              <div className='flex justify-between gap-2'>
                {/* Amount field */}
                <CustomFormField
                  name='amount'
                  label='Commission'
                  type='number'
                  placeholder='Enter commission'
                  rules={{
                    validate: value => {
                      if (form.getValues('commission_percent') && typeof value === 'string' && parseFloat(value) > 100)
                        return 'Commission cannot be greater than 100 when using percentage'

                      return true
                    }
                  }}
                  register={register}
                  errors={errors}
                  fieldClassName={`${fieldStyle} flex-1`}
                  labelClassName={labelStyle}
                />

                {/* Commission percent field */}
                <FormField
                  control={control}
                  name='commission_percent'
                  render={({ field }) => (
                    <FormItem>
                      {/* <FormLabel className='opacity-0 pointer-events-none'>Action</FormLabel> */}
                      <FormControl>
                        <div className='flex gap-1'>
                          <Button
                            type='button'
                            variant={!field.value ? 'default' : 'outline'}
                            size='icon'
                            onClick={() => field.onChange(false)}
                            className='h-7 w-7'
                          >
                            $
                          </Button>
                          <Button
                            type='button'
                            variant={field.value ? 'default' : 'outline'}
                            size='icon'
                            onClick={() => field.onChange(true)}
                            className='h-7 w-7'
                          >
                            %
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditCommissionModal
