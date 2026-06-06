'use client'

import { useEffect } from 'react'

import { Path, RegisterOptions, useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import OrganizationService from '@/services/api/organizations.service'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { InputType, SelectOption } from '@/components/form/fields/types'
import CustomFormField from '@/components/form/CustomFormField'

interface CreateOrEditOrganizationModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId?: string
  companyDetails?: any
  onSuccess?: () => void
}

type FormFieldType = {
  name: Path<any>
  type?: InputType
  label?: string
  placeholder?: string
  rules?: RegisterOptions<any, Path<any>>
  selectOptions?: SelectOption[]
  onChange?: (value: any) => void
  onBlur?: () => void
  fieldClassName?: string
  description?: string
  disabled?: boolean
}

const CreateOrEditOrganizationModal = ({
  mode = 'create',
  open,
  onOpenChange,
  companyId,
  companyDetails,
  onSuccess
}: CreateOrEditOrganizationModalProps) => {
  const form = useForm<any>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      user_type: 'organization',
      password: '',
      password_confirmation: '',
      subdomain: '',
      address: '',
      company_name: ''
    },
    mode: 'onSubmit'
  })

  const { handleSubmit, control, reset, register, setValue, formState } = form
  const { isSubmitting, errors } = formState

  // Reset form when modal state or companyDetails changes
  useEffect(() => {
    if (open) {
      if (mode === 'create') {
        reset({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          user_type: 'organization',
          password: '',
          password_confirmation: '',
          subdomain: '',
          address: '',
          company_name: ''
        })
      } else {
        reset({
          first_name: companyDetails?.first_name || '',
          last_name: companyDetails?.last_name || '',
          email: companyDetails?.email || '',
          phone: companyDetails?.userable?.phone || '',
          address: companyDetails?.userable?.address || '',
          company_name: companyDetails?.userable?.company_name || ''
        })
      }
    }
  }, [open, companyDetails, mode, reset])

  const onSubmit = async (data: any) => {
    if (mode === 'create') {
      try {
        const payload = {
          ...data,
          password_confirmation: data.password,
          user_type: 'organization'
        }

        await OrganizationService.store(payload)
        toast.success('Company created successfully')
        onOpenChange(false)
        onSuccess?.()
      } catch (error: any) {
        if (error?.errors && typeof error.errors === 'object') {
          Object.values(error.errors).forEach((errMsg: any) => {
            errMsg?.map((msg: string) => toast.error(msg))
          })
        } else {
          toast.error(error?.message || 'Something went wrong')
        }
      }
    } else if (mode === 'edit' && companyId) {
      try {
        await OrganizationService.update(companyId, data)
        toast.success('Company updated successfully')
        onOpenChange(false)
        onSuccess?.()
      } catch (error: any) {
        if (error?.errors && typeof error.errors === 'object') {
          Object.values(error.errors).forEach((errMsg: any) => {
            errMsg?.map((msg: string) => toast.error(msg))
          })
        } else {
          toast.error(error?.message || 'Something went wrong')
        }
      }
    }
  }

  const onCancel = () => {
    onOpenChange(false)
  }

  const fields: FormFieldType[] = [
    {
      name: 'company_name',
      type: 'text',
      label: 'Company Name',
      placeholder: 'Company Name',
      rules: { required: 'Company Name is required' },
      fieldClassName: 'sm:col-span-2'
    },
    {
      name: 'first_name',
      type: 'text',
      label: 'First Name',
      placeholder: 'First name',
      rules: { required: 'First Name is required' }
    },
    {
      name: 'last_name',
      type: 'text',
      label: 'Last Name',
      placeholder: 'Last name',
      rules: { required: 'Last Name is required' }
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'Company email',
      rules: { required: 'Email is required' },
      disabled: mode === 'edit'
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone',
      placeholder: 'Phone'
    },
    ...(mode === 'create'
      ? [
          {
            name: 'subdomain',
            type: 'text',
            label: 'Subdomain',
            placeholder: 'e.g. acme',

            // fieldClassName: 'sm:col-span-2',
            description: 'Lowercase letters, numbers, and hyphens only. Max 63 characters.',
            rules: {
              required: 'Subdomain is required',
              pattern: {
                value: /^(?=.{1,63}$)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
                message: 'Invalid subdomain. Use lowercase letters, numbers, and hyphens only.'
              }
            },
            onChange: (val: any) => {
              const sanitized = String(val)
                .toLowerCase()
                .replace(/\s+/g, '') // remove spaces
                .replace(/[^a-z0-9-]/g, '') // keep only allowed chars
                .replace(/-+/g, '-') // collapse multiple hyphens
                .replace(/^-+/, '') // no leading hyphen
                .slice(0, 63) // max label length

              setValue('subdomain', sanitized)
            }
          } as FormFieldType,
          {
            name: 'password',
            type: 'password',
            label: 'Password',
            placeholder: 'Password',
            rules: { required: 'Password is required' }
          } as FormFieldType
        ]
      : []),
    {
      name: 'address',
      type: 'textarea',
      label: 'Address',
      placeholder: 'Full address',
      fieldClassName: 'sm:col-span-2',
      rules: { required: 'Address is required' }
    }
  ]

  const sharedFieldClass = 'grid grid-cols-[100px_minmax(0,_1fr)] gap-2'
  const sharedLabelClass = 'justify-end items-start self-start text-right pt-1.5'

  const renderFormField = (field: FormFieldType) => {
    return (
      <CustomFormField
        key={field.name}
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
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create Company' : 'Edit Company'}
      description={mode === 'create' ? 'Add a new company' : 'Update company information'}
      maxWidth='3xl'
      disableClose={isSubmitting}
      isLoading={isSubmitting}
      actions={
        <div className='flex gap-3'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onCancel}
            disabled={isSubmitting}
            className='flex-1 border-border text-light hover:bg-bg-3'
          >
            Cancel
          </Button>
          <Button type='submit' size='sm' onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className='flex-1'>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-4 relative'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2'>{fields.map(renderFormField)}</div>
      </form>
    </CommonDialog>
  )
}

export default CreateOrEditOrganizationModal
