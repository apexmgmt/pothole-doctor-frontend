'use client'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import CustomFormField from '@/components/form/CustomFormField'
import TaskService from '@/services/api/tasks/tasks.service'

interface BulkActionTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  selectedIds: string[]
}

interface FormValues {
  status: string
}

const BulkActionTaskModal = ({ open, onOpenChange, onSuccess, selectedIds }: BulkActionTaskModalProps) => {
  const form = useForm<FormValues>({
    defaultValues: {
      status: ''
    }
  })

  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isSubmitting }
  } = form

  const onSubmit = async (values: FormValues) => {
    try {
      await TaskService.bulkAction(selectedIds, values.status)
      toast.success('Tasks updated successfully')
      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update tasks')
    }
  }

  const onCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  const fieldStyle = 'grid grid-cols-[100px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  return (
    <CommonDialog
      isLoading={isSubmitting}
      loadingMessage='Updating tasks...'
      open={open}
      onOpenChange={onOpenChange}
      title='Bulk Action'
      description={`Update status for ${selectedIds.length} selected task${selectedIds.length > 1 ? 's' : ''}.`}
      disableClose={isSubmitting}
      className='sm:max-w-100!'
      actions={
        <div className='flex gap-3'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onCancel}
            disabled={isSubmitting}
            className='flex-1'
          >
            Cancel
          </Button>
          <Button type='submit' size='sm' onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className='flex-1'>
            {isSubmitting ? 'Updating...' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 mr-0.5 mt-2'>
          <CustomFormField
            name='status'
            type='select'
            label='Status'
            placeholder='Select status'
            control={control}
            register={register}
            rules={{ required: 'Status is required' }}
            selectOptions={[
              { value: 'backlog', label: 'Backlog' },
              { value: 'to-do', label: 'To Do' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
        </form>
      </Form>
    </CommonDialog>
  )
}

export default BulkActionTaskModal
