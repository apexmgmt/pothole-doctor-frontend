'use client'

import { TaskType, TaskTypePayload } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import TaskTypeService from '@/services/api/settings/task_types.service'

interface CreateOrEditTaskTypeModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  taskTypeId?: string
  taskTypeDetails?: TaskType
  onSuccess?: () => void
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Task type name must be at least 2 characters' }),
  is_editable: z.boolean()
})

type FormValues = z.infer<typeof formSchema>

const CreateOrEditTaskTypeModal = ({
  mode = 'create',
  open,
  onOpenChange,
  taskTypeId,
  taskTypeDetails,
  onSuccess
}: CreateOrEditTaskTypeModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: taskTypeDetails?.name || '',
      is_editable: mode === 'create' ? true : taskTypeDetails?.is_editable === 1
    }
  })

  // Reset form when taskTypeDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: taskTypeDetails?.name || '',
        is_editable: mode === 'create' ? true : taskTypeDetails?.is_editable === 1
      })
    }
  }, [taskTypeDetails, open, form, mode])

  const onSubmit = async (values: FormValues) => {
    const payload: TaskTypePayload = {
      name: values.name,
      is_editable: values.is_editable ? 1 : 0
    }

    setIsLoading(true)

    if (mode === 'create') {
      try {
        await TaskTypeService.store(payload)
          .then(response => {
            toast.success('Task type created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
            setIsLoading(false)
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create task type')
            setIsLoading(false)
          })
      } catch (error) {
        toast.error('Something went wrong while creating the task type!')
        setIsLoading(false)
      }
    } else if (mode === 'edit' && taskTypeId) {
      try {
        await TaskTypeService.update(taskTypeId, payload)
          .then(response => {
            toast.success('Task type updated successfully')
            onOpenChange(false)
            onSuccess?.()
            setIsLoading(false)
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update task type')
            setIsLoading(false)
          })
      } catch (error) {
        toast.error('Something went wrong while updating the task type!')
        setIsLoading(false)
      }
    }
  }

  const onCancel = () => {
    form.reset({
      name: taskTypeDetails?.name || '',
      is_editable: mode === 'create' ? true : taskTypeDetails?.is_editable === 1
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading task type...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Task Type' : 'Edit Task Type'}
      description={mode === 'create' ? 'Add a new task type to the system' : 'Update task type information'}
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
          {/* Contractor Type Name Field */}
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter task type name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Status Radio Group */}
          <FormField
            control={form.control}
            name='is_editable'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Editable</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={val => field.onChange(val === 'true')}
                    value={field.value ? 'true' : 'false'}
                    className=' flex flex-row gap-4 items-center'
                  >
                    <div className='flex gap-2 items-center'>
                      <RadioGroupItem value='true' id='yes' />
                      <Label htmlFor='yes' className='cursor-pointer'>
                        Yes
                      </Label>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <RadioGroupItem value='false' id='no' />
                      <Label htmlFor='no' className='cursor-pointer'>
                        No
                      </Label>
                    </div>
                  </RadioGroup>
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

export default CreateOrEditTaskTypeModal
