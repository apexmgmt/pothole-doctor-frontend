'use client'

import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { InterestLevel, InterestLevelPayload } from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import InterestLevelService from '@/services/api/interest_levels.service'

interface CreateOrEditInterestLevelModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  interestLevelId?: string
  interestLevelDetails?: InterestLevel
  onSuccess?: () => void
}

type FormValues = {
  name: string
}

const CreateOrEditInterestLevelModal = ({
  mode = 'create',
  open,
  onOpenChange,
  interestLevelId,
  interestLevelDetails,
  onSuccess
}: CreateOrEditInterestLevelModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    defaultValues: {
      name: interestLevelDetails?.name || ''
    }
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: interestLevelDetails?.name || ''
      })
    }
  }, [interestLevelDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    const payload: InterestLevelPayload = {
      name: values.name
    }

    setIsLoading(true)

    try {
      if (mode === 'create') {
        await InterestLevelService.store(payload)
        toast.success('Interest level created successfully')
        form.reset()
        onOpenChange(false)
        onSuccess?.()
      } else if (mode === 'edit' && interestLevelId) {
        await InterestLevelService.update(interestLevelId, payload)
        toast.success('Interest level updated successfully')
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save interest level')
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    form.reset({
      name: interestLevelDetails?.name || ''
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage={mode === 'create' ? 'Creating interest level...' : 'Updating interest level...'}
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create Interest Level' : 'Edit Interest Level'}
      description={mode === 'create' ? 'Add a new interest level to the system' : 'Update interest level information'}
      maxWidth='sm'
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
          <FormField
            control={form.control}
            name='name'
            rules={{
              required: 'Interest level name is required',
              minLength: { value: 2, message: 'Must be at least 2 characters' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter interest level name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditInterestLevelModal
