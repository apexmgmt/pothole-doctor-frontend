'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import CompanyService from '@/services/api/company.service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { SpinnerCustom } from '@/components/ui/spinner'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { CreateOrEditStaffProps, StaffPayload } from '@/types'
import StaffService from '@/services/api/staff.service'

const defaultValues: StaffPayload = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  user_type: 'admin',
  password: '',
  password_confirmation: '',
  address: '',
  roles: [],
  permissions: []
}

const CreateOrEditStaff: React.FC<CreateOrEditStaffProps> = ({
  mode = 'create',
  permissions,
  roles,
  staffId = null,
  staffData = null
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
        permissions: staffData.permissions?.map(permission => permission.name) || []
      }
    : defaultValues

  const form = useForm<StaffPayload>({ defaultValues: initialValues, mode: 'onSubmit' })
  const { handleSubmit, control, getValues, reset, formState, watch } = form
  const { isSubmitting } = formState
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedRole, setSelectedRole] = useState<string>('')

  const selectedRoles = watch('roles') || []

  useEffect(() => {
    dispatch(setPageTitle('Manage Staff'))
  }, [dispatch])

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
        permissions: staffData.permissions?.map(permission => permission.name) || []
      })
    }
  }, [mode, staffData, reset])

  const onSubmit = async (data: StaffPayload) => {
    setIsLoading(true)
    if (mode === 'create') {
      try {
        StaffService.store(data)
          .then(response => {
            setIsLoading(false)
            toast.success('Staff created successfully')
            router.push('/erp/staffs')
            reset()
          })
          .catch(error => {
            toast.error('Failed to create staff')
            setIsLoading(false)
          })
      } catch (error) {
        toast.error('Something went wrong!')
        setIsLoading(false)
      }
    } else if (mode === 'edit' && staffId != null) {
      try {
        StaffService.update(staffId, data)
          .then(response => {
            setIsLoading(false)
            toast.success('Staff updated successfully')
            router.push('/erp/staffs')
          })
          .catch(error => {
            toast.error('Failed to update staff')
            setIsLoading(false)
          })
      } catch (error) {
        toast.error('Something went wrong!')
        setIsLoading(false)
      }
    }
  }

  const onCancel = () => {
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
        permissions: staffData.permissions?.map(permission => permission.name) || []
      })
    } else {
      reset(defaultValues)
    }
  }

  const handleRoleSelect = (roleName: string) => {
    const currentRoles = getValues('roles') || []
    if (!currentRoles.includes(roleName)) {
      form.setValue('roles', [...currentRoles, roleName])
    }
    setSelectedRole('')
  }

  const handleRoleRemove = (roleName: string) => {
    const currentRoles = getValues('roles') || []
    form.setValue(
      'roles',
      currentRoles.filter(r => r !== roleName)
    )
  }

  const modules = Object.keys(permissions)

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='bg-bg-2 rounded-lg border border-border p-6 w-full max-w-3xl space-y-6 relative'
        >
          {isLoading && <SpinnerCustom />}

          <h2 className='text-xl font-semibold text-light'>{mode === 'create' ? 'Create Staff' : 'Edit Staff'}</h2>

          <div className='grid grid-cols-2 gap-6'>
            <FormField
              control={control}
              name='first_name'
              rules={{ required: 'Required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='First name'
                      className='bg-bg-3 border-border text-light placeholder:text-gray'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name='last_name'
              rules={{ required: 'Required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Last name'
                      className='bg-bg-3 border-border text-light placeholder:text-gray'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name='email'
              rules={{
                required: 'Required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email'
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='staff email'
                      className='bg-bg-3 border-border text-light placeholder:text-gray'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='phone'
                      className='bg-bg-3 border-border text-light placeholder:text-gray'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name='password'
              rules={{ required: mode === 'create' ? 'Required' : false }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password {mode === 'edit' && '(Leave blank to keep current)'}</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='password'
                      className='bg-bg-3 border-border text-light placeholder:text-gray'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name='password_confirmation'
              rules={{
                required: mode === 'create' ? 'Required' : false,
                validate: (value: string) => {
                  const password = getValues('password')
                  if (password && value !== password) return 'Does not match'
                  return true
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='confirm password'
                      className='bg-bg-3 border-border text-light placeholder:text-gray'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name='address'
              rules={{ required: 'Required' }}
              render={({ field }) => (
                <FormItem className='col-span-2'>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <textarea
                      rows={3}
                      placeholder='Full address'
                      className='flex w-full rounded-md border border-border bg-bg-3 px-3 py-2 text-sm text-light placeholder:text-gray focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Roles Field */}
            <FormField
              control={control}
              name='roles'
              render={({ field }) => (
                <FormItem className='col-span-2'>
                  <FormLabel>Roles</FormLabel>
                  <FormControl>
                    <div className='space-y-3'>
                      <Select value={selectedRole} onValueChange={handleRoleSelect}>
                        <SelectTrigger className='bg-bg-3 border-border text-light w-full'>
                          <SelectValue placeholder='Select roles' />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map(role => (
                            <SelectItem key={role.id} value={role.name} disabled={selectedRoles.includes(role.name)}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedRoles.length > 0 && (
                        <div className='flex flex-wrap gap-2'>
                          {selectedRoles.map(roleName => (
                            <div
                              key={roleName}
                              className='flex items-center gap-2 bg-bg-3 border border-border rounded-md px-3 py-1.5 text-sm text-light'
                            >
                              <span>{roleName}</span>
                              <button
                                type='button'
                                onClick={() => handleRoleRemove(roleName)}
                                className='text-gray hover:text-light'
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Permissions Section */}
          <Accordion type='single' collapsible className='space-y-6'>
            <AccordionItem value='permissions' className='border-none'>
              <AccordionTrigger className='text-base font-semibold text-light hover:no-underline py-0 pb-4'>
                Permissions (Optional)
              </AccordionTrigger>
              <AccordionContent>
                <div className='space-y-6'>
                  {modules.map(module => (
                    <div key={module} className='space-y-3'>
                      <h3 className='text-base font-medium text-light capitalize border-b border-border pb-2'>
                        {module}
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-2'>
                        {permissions[module]
                          .sort((a, b) => a.id - b.id)
                          .map(permission => (
                            <FormField
                              key={permission.id}
                              control={control}
                              name='permissions'
                              render={({ field }) => {
                                return (
                                  <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(permission.name)}
                                        onCheckedChange={checked => {
                                          return checked
                                            ? field.onChange([...(field.value || []), permission.name])
                                            : field.onChange(field.value?.filter(value => value !== permission.name))
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className='text-sm font-normal cursor-pointer text-light'>
                                      {permission.name}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className='flex gap-3 pt-4 border-t border-border'>
            <Button
              type='submit'
              variant='outline'
              disabled={isLoading}
              className='flex-1 bg-bg-3 text-light disabled:opacity-50'
            >
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Staff' : 'Update Staff'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isLoading}
              className='flex-1 border-border text-light disabled:opacity-50'
            >
              Reset
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default CreateOrEditStaff
