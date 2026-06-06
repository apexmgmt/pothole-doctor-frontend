'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Path, RegisterOptions, useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

import { Form } from '@/components/ui/form'
import { SpinnerCustom } from '@/components/ui/spinner'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { CreateOrEditStaffProps, StaffPayload } from '@/types'
import StaffService from '@/services/api/staff.service'
import Link from 'next/link'
import { InputType, SelectOption } from '@/components/form/fields/types'
import CustomFormField from '@/components/form/CustomFormField'
import { ScrollArea } from '@/components/ui/scroll-area'

const defaultValues: StaffPayload = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  user_type: 'staff',
  password: '',
  password_confirmation: '',
  address: '',
  roles: [],
  permissions: [],
  commission_type_id: ''
}

type FormFieldType = {
  name: Path<StaffPayload>
  type?: InputType
  label?: string
  placeholder?: string
  rules?: RegisterOptions<StaffPayload, Path<StaffPayload>>
  selectOptions?: SelectOption[]
  onChange?: (value: any) => void
  onBlur?: () => void
  fieldClassName?: string
  description?: string
  disabled?: boolean
}

const CreateOrEditStaff: React.FC<CreateOrEditStaffProps> = ({
  mode = 'create',
  permissions,
  roles,
  commissionTypes = [],
  staffId = null,
  staffData = null,
  isTenant = false
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Initialize form with staffData if in edit mode
  const initialValues: StaffPayload = staffData
    ? {
        first_name: staffData.first_name || '',
        last_name: staffData.last_name || '',
        email: staffData.email || '',
        phone: staffData.userable?.phone || '',
        user_type: staffData.guard || 'admin',
        password: '',
        password_confirmation: '',
        address: staffData.userable?.address || '',
        roles: staffData.roles?.map(role => role.name) || [],
        permissions: staffData.permissions?.map(permission => permission.name) || [],
        commission_type_id: staffData?.userable?.commission_type_id || ''
      }
    : defaultValues

  const form = useForm<StaffPayload>({ defaultValues: initialValues, mode: 'onSubmit' })
  const { handleSubmit, control, getValues, reset, formState, watch, register, setValue } = form
  const { errors } = formState
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    dispatch(setPageTitle('Manage Staff'))
  }, [dispatch])

  // Auto-sync password_confirmation with password
  useEffect(() => {
    const password = watch('password')

    setValue('password_confirmation', password)
  }, [watch('password'), setValue])

  // Update form when staffData changes
  useEffect(() => {
    if (mode === 'edit' && staffData) {
      reset({
        first_name: staffData.first_name || '',
        last_name: staffData.last_name || '',
        email: staffData.email || '',
        phone: staffData.userable?.phone || '',
        user_type: staffData.guard || 'admin',
        password: '',
        password_confirmation: '',
        address: staffData.userable?.address || '',
        roles: staffData.roles?.map(role => role.name) || [],
        permissions: staffData.permissions?.map(permission => permission.name) || [],
        commission_type_id: staffData?.userable?.commission_type_id || ''
      })
    }
  }, [mode, staffData, reset])

  const handleApiError = (error: any, fallbackMessage: string) => {
    setIsLoading(false)

    if (error?.errors && typeof error.errors === 'object') {
      Object.entries(error.errors).forEach(([field, messages]) => {
        const msg = Array.isArray(messages) ? messages[0] : String(messages)

        form.setError(field as keyof StaffPayload, { type: 'server', message: msg })
      })

      if (error.message) {
        toast.error(error.message)
      }
    } else {
      toast.error(typeof error.message === 'string' ? error.message : fallbackMessage)
    }
  }

  const onSubmit = async (data: StaffPayload) => {
    setIsLoading(true)

    if (mode === 'create') {
      try {
        StaffService.store(data)
          .then(() => {
            setIsLoading(false)
            toast.success('Staff created successfully')
            router.push('/erp/staffs')
          })
          .catch(error => handleApiError(error, 'Failed to create staff'))
      } catch (error) {
        toast.error('Something went wrong!')
        setIsLoading(false)
      }
    } else if (mode === 'edit' && staffId != null) {
      try {
        StaffService.update(staffId, data)
          .then(() => {
            setIsLoading(false)
            toast.success('Staff updated successfully')
            router.push('/erp/staffs')
          })
          .catch(error => handleApiError(error, 'Failed to update staff'))
      } catch (error) {
        toast.error('Something went wrong!')
        setIsLoading(false)
      }
    }
  }

  const fields: FormFieldType[] = [
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
      placeholder: 'Staff email',
      rules: { required: 'Email is required' }
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone',
      placeholder: 'Phone'
    },
    {
      name: 'password',
      type: 'password',
      label: mode === 'edit' ? 'Password' : 'Password',
      placeholder: 'Password',
      description: mode === 'edit' ? 'Leave blank to keep current' : undefined,
      rules: { required: mode === 'create' ? 'Password is required' : false }
    },
    ...(isTenant
      ? [
          {
            name: 'commission_type_id',
            type: 'select',
            label: 'Commission Type',
            placeholder: 'Select commission type',
            selectOptions: commissionTypes.map(ct => ({ value: ct.id, label: ct.name }))
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
    },
    {
      name: 'roles',
      type: 'multiselect',
      label: 'Roles',
      placeholder: 'Select roles',
      selectOptions: roles.map(role => ({ value: role.name, label: role.name })),
      fieldClassName: 'sm:col-span-2'
    }
  ]

  const sharedFieldClass = 'grid grid-cols-[116px_minmax(0,_1fr)] gap-2'
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

  const modules = Object.keys(permissions)

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className='bg-bg-2 rounded-lg border border-border p-6 w-full max-w-6xl flex flex-col gap-y-6 relative mx-auto'
        >
          {isLoading && <SpinnerCustom />}

          <h2 className='text-xl font-semibold text-light'>{mode === 'create' ? 'Create Staff' : 'Edit Staff'}</h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2'>{fields.map(renderFormField)}</div>

          {/* Permissions Section */}
          <Accordion type='single' collapsible>
            <AccordionItem value='permissions' className='border-none'>
              <AccordionTrigger className='text-base font-semibold text-light hover:no-underline p-2.5 cursor-pointer bg-white/10 rounded-lg'>
                Permissions (Optional)
              </AccordionTrigger>

              <AccordionContent className='p-0 pt-4'>
                {modules.map((module, idx) => {
                  const moduleName = module.split(/[-_]+/).join(' ').toLocaleLowerCase()

                  return (
                    <div
                      key={`${module}-${idx}`}
                      className='grid grid-cols-[136px_minmax(0,_1fr)] items-center gap-5 hover:bg-accent/10 p-2.5 border-b last:border-none border-border'
                    >
                      <h3 className='text-sm font-medium text-light capitalize'>{moduleName}</h3>
                      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-3'>
                        {permissions[module]
                          .sort((a, b) => a.id - b.id)
                          .map(permission => {
                            const label = (permission?.name ?? '').toLocaleLowerCase().replace(moduleName, '').trim()

                            return (
                              <CustomFormField
                                key={permission.id}
                                type='checkbox'
                                name={`permission_${permission.id}`}
                                label={label}
                                value={watch('permissions')?.includes(permission.name)}
                                onChange={checked => {
                                  const currentPermissions = getValues('permissions') || []

                                  if (checked) {
                                    setValue('permissions', [...currentPermissions, permission.name])
                                  } else {
                                    setValue(
                                      'permissions',
                                      currentPermissions.filter(p => p !== permission.name)
                                    )
                                  }
                                }}
                                labelClassName='capitalize'
                              />
                            )
                          })}
                      </div>
                    </div>
                  )
                })}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className='flex gap-3 pt-4 border-t border-border'>
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='flex-1 border-border text-light disabled:opacity-50'
              asChild
            >
              <Link href='/erp/staffs/' prefetch>
                Cancel
              </Link>
            </Button>
            <Button type='submit' size='sm' disabled={isLoading} className='flex-1 disabled:opacity-50'>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Staff' : 'Update Staff'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default CreateOrEditStaff
