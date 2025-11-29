'use client'

import {
  PaymentTermPayload,
  PartnerType,
  PartnerTypePayload,
  PaymentTerm,
  ContactType,
  ContactTypePayload,
  CommissionType,
  CommissionFilter,
  CommissionBase,
  Commission,
  CreateOrEditCommissionModalProps,
  CommissionPayload
} from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import ContactTypeService from '@/services/api/settings/contact_types.service'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import CommissionService from '@/services/api/settings/commissions.service'
import { Separator } from '@/components/ui/separator'

const formSchema = z
  .object({
    commission_type: z.string().min(1, { message: 'Please select a commission type' }),
    based_on: z.string().min(1, { message: 'Please select what the commission is based on' }),
    per: z.string().min(1, { message: 'Please select per option' }),
    filter_type: z.string().min(1, { message: 'Please select a filter type' }),
    amount: z.string(),
    min_amount: z.string(),
    max_amount: z.string(),
    filter_percent: z.boolean(),
    commission_percent: z.boolean()
  })
  .refine(
    data => {
      if (data.filter_percent && parseFloat(data.min_amount) > 0) {
        return parseFloat(data.min_amount) <= 100
      }
      return true
    },
    {
      message: 'Min amount cannot be greater than 100 when using percentage',
      path: ['min_amount']
    }
  )
  .refine(
    data => {
      if (data.filter_percent && parseFloat(data.max_amount) > 0) {
        return parseFloat(data.max_amount) <= 100
      }
      return true
    },
    {
      message: 'Max amount cannot be greater than 100 when using percentage',
      path: ['max_amount']
    }
  )
  .refine(
    data => {
      if (data.commission_percent && parseFloat(data.amount) > 0) {
        return parseFloat(data.amount) <= 100
      }
      return true
    },
    {
      message: 'Commission cannot be greater than 100 when using percentage',
      path: ['amount']
    }
  )

type FormValues = z.infer<typeof formSchema>

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
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commission_type: commissionDetails?.commission_type || '',
      based_on: commissionDetails?.based_on || '',
      per: commissionDetails?.per || 'Per Job',
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
      form.reset({
        commission_type: commissionDetails?.commission_type || '',
        based_on: commissionDetails?.based_on || '',
        per: commissionDetails?.per || 'Per Job',
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
            form.reset()
            onOpenChange(false)
            onSuccess?.()
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
      per: commissionDetails?.per || 'Per Job',
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

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading commission...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Commission' : 'Edit Commission'}
      description={mode === 'create' ? 'Add a new commission to the system' : 'Update commission information'}
      maxWidth='3xl'
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
          {/* Commission Name Field */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='commission_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Commission Name <span className='text-red-500'>*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a commission type' />
                      </SelectTrigger>
                    </FormControl>
                    {commissionTypes.length > 0 && (
                      <SelectContent>
                        {commissionTypes.map(commissionType => (
                          <SelectItem key={commissionType.id} value={commissionType.slug.toString()}>
                            {commissionType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    )}
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator />
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {/* Based on Field */}
            <FormField
              control={form.control}
              name='based_on'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-nowrap'>
                    Based On <span className='text-red-500'>*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a based on' />
                      </SelectTrigger>
                    </FormControl>
                    {commissionBases.length > 0 && (
                      <SelectContent>
                        {commissionBases.map(commissionBase => (
                          <SelectItem key={commissionBase.id} value={commissionBase.slug.toString()}>
                            {commissionBase.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    )}
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Per Field */}
            <FormField
              control={form.control}
              name='per'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Per <span className='text-red-500'>*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a per' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='Per Job'>Per Job</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator />

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            {/* Filter Field */}
            <FormField
              control={form.control}
              name='filter_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Filter <span className='text-red-500'>*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a filter type' />
                      </SelectTrigger>
                    </FormControl>
                    {commissionFilters.length > 0 && (
                      <SelectContent>
                        {commissionFilters.map(commissionFilter => (
                          <SelectItem key={commissionFilter.id} value={commissionFilter.slug.toString()}>
                            {commissionFilter.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    )}
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {filterType !== 'same-as-store' && (
              <div className='col-span-2 flex flex-row gap-2'>
                {/* Min amount field - shown for 'between' and 'greater-than' */}
                {(filterType === 'between' || filterType === 'greater-than') && (
                  <FormField
                    control={form.control}
                    name='min_amount'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Min Amount <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input type='number' placeholder='Enter min amount' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Max amount field - shown for 'between' and 'less-than' */}
                {(filterType === 'between' || filterType === 'less-than') && (
                  <FormField
                    control={form.control}
                    name='max_amount'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Max Amount <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input type='number' placeholder='Enter max amount' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Filter percent field - shown for all except 'same-as-store' */}
                <FormField
                  control={form.control}
                  name='filter_percent'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='opacity-0 pointer-events-none'>Action</FormLabel>
                      <FormControl>
                        <div className='flex gap-1'>
                          <Button
                            type='button'
                            variant={!field.value ? 'default' : 'outline'}
                            size='icon'
                            onClick={() => field.onChange(false)}
                          >
                            $
                          </Button>
                          <Button
                            type='button'
                            variant={field.value ? 'default' : 'outline'}
                            size='icon'
                            onClick={() => field.onChange(true)}
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
                <FormField
                  control={form.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>
                        Commission <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='Enter commission' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Commission percent field */}
                <FormField
                  control={form.control}
                  name='commission_percent'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='opacity-0 pointer-events-none'>Action</FormLabel>
                      <FormControl>
                        <div className='flex gap-1'>
                          <Button
                            type='button'
                            variant={!field.value ? 'default' : 'outline'}
                            size='icon'
                            onClick={() => field.onChange(false)}
                          >
                            $
                          </Button>
                          <Button
                            type='button'
                            variant={field.value ? 'default' : 'outline'}
                            size='icon'
                            onClick={() => field.onChange(true)}
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
