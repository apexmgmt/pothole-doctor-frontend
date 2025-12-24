'use client'

import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { ProductCategory, ProductCategoryPayload } from '@/types/product_categories.types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'


import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import ProductCategoryService from '@/services/api/product_categories.service'

interface CreateOrEditProductCategoryModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  productCategoryId?: string
  productCategoryDetails?: ProductCategory
  onSuccess?: () => void
}

interface FormValues {
  name: string
}

const CreateOrEditProductCategoryModal = ({
  mode = 'create',
  open,
  onOpenChange,
  productCategoryId,
  productCategoryDetails,
  onSuccess
}: CreateOrEditProductCategoryModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    defaultValues: {
      name: productCategoryDetails?.name || ''
    }
  })

  // Reset form when productCategoryDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: productCategoryDetails?.name || ''
      })
    }
  }, [productCategoryDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)

    const payload: ProductCategoryPayload = {
      name: values.name,
      type: 'product'
    }

    try {
      if (mode === 'create') {
        await ProductCategoryService.store(payload)
        toast.success('Product category created successfully')
      } else if (mode === 'edit' && productCategoryId) {
        await ProductCategoryService.update(productCategoryId, payload)
        toast.success('Product category updated successfully')
      }

      onOpenChange(false)
      onSuccess?.()
      form.reset()
    } catch (error: any) {
      toast.error(error?.message || 'Operation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    form.reset({
      name: productCategoryDetails?.name || ''
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading product category...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create Product Category' : 'Edit Product Category'}
      description={mode === 'create' ? 'Add a new product category' : 'Update product category information'}
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
          {/* Category Name */}
          <FormField
            control={form.control}
            name='name'
            rules={{
              required: 'Category name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Category Name <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter category name' {...field} />
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

export default CreateOrEditProductCategoryModal
