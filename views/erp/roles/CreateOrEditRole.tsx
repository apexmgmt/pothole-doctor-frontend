'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'

import * as z from 'zod'

import { Path, RegisterOptions, useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { PermissionsByModule, Role } from '@/types'

import { Form, FormLabel } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

import RoleService from '@/services/api/role.service'

import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import Link from 'next/link'
import { InputType, SelectOption } from '@/components/form/fields/types'
import CustomFormField from '@/components/form/CustomFormField'

interface CreateOrEditRoleProps {
  mode?: 'create' | 'edit'
  permissions: PermissionsByModule
  roleId?: string | undefined
  roleDetails?: Role | undefined | {}
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Role name must be at least 2 characters' }),
  permissions: z.array(z.string()).min(1, { message: 'At least one permission must be selected' })
})

type FormValues = z.infer<typeof formSchema>

const CreateOrEditRole = ({ mode = 'create', permissions = {}, roleId, roleDetails }: CreateOrEditRoleProps) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Set page title
  useEffect(() => {
    dispatch(setPageTitle('Manage Roles'))
  }, [dispatch])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: roleDetails && 'name' in roleDetails ? roleDetails.name : '',
      permissions: roleDetails && 'permissions' in roleDetails ? roleDetails.permissions.map(p => p.name) : []
    }
  })

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    register,
    formState: { errors }
  } = form

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)

    if (mode === 'create') {
      try {
        RoleService.store(values)
          .then(response => {
            toast.success('Role created successfully')
            form.reset()
            router.push('/erp/roles')
            setIsLoading(false)
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create role')
            setIsLoading(false)
          })
      } catch (error) {
        toast.error('Something went wrong while creating the role!')
        setIsLoading(false)
      }
    } else if (mode === 'edit' && roleId) {
      try {
        RoleService.update(roleId, values)
          .then(response => {
            toast.success('Role updated successfully')
            router.push('/erp/roles')
            setIsLoading(false)
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update role')
            setIsLoading(false)
          })
      } catch (error) {
        toast.error('Something went wrong while updating the role!')
        setIsLoading(false)
      }
    }
  }

  const onCancel = () => {
    form.reset({
      name: roleDetails && 'name' in roleDetails ? roleDetails.name : '',
      permissions: roleDetails && 'permissions' in roleDetails ? roleDetails.permissions.map(p => p.name) : []
    })
  }

  const modules = Object.keys(permissions)

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='bg-bg-2 rounded-lg border border-border p-6 w-full max-w-6xl space-y-6 mx-auto'
        >
          <h2 className='text-xl font-semibold text-light'>{mode === 'create' ? 'Create New Role' : 'Edit Role'}</h2>

          {/* Role Name Field */}
          <CustomFormField
            type='text'
            name='name'
            label='Role Name'
            placeholder='Enter role name'
            register={register}
            errors={errors}
            fieldClassName='grid grid-cols-[70px_minmax(0,_1fr)]'
          />

          {/* Permissions Section */}
          <div>
            <div className='space-y-1'>
              <FormLabel className='text-base font-semibold text-light'>Permissions</FormLabel>
              {errors.permissions && <p className='text-sm text-destructive'>{errors.permissions.message}</p>}
            </div>

            {modules
              .sort((a, b) => a.localeCompare(b))
              .map((module, idx) => {
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
          </div>

          {/* Submit Buttons */}
          <div className='flex gap-3 pt-4 border-t border-border'>
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='flex-1 border-border text-light disabled:opacity-50'
              asChild
            >
              <Link href='/erp/roles' prefetch>
                Cancel
              </Link>
            </Button>
            <Button
              type='submit'
              size='sm'
              disabled={form.formState.isSubmitting || isLoading}
              className='flex-1 disabled:opacity-50'
            >
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Role' : 'Update Role'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default CreateOrEditRole
