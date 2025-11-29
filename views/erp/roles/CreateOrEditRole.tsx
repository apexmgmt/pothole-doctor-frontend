'use client'

import { PermissionsByModule, Role } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import RoleService from '@/services/api/role.service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'

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

  const onSubmit = async (values: FormValues) => {
    if (mode === 'create') {
      try {
        RoleService.store(values)
          .then(response => {
            toast.success('Role created successfully')
            form.reset()
            router.push('/erp/roles')
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create role')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the role!')
      }
    } else if (mode === 'edit' && roleId) {
      try {
        RoleService.update(roleId, values)
          .then(response => {
            toast.success('Role updated successfully')
            router.push('/erp/roles')
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update role')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the role!')
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
          onSubmit={form.handleSubmit(onSubmit)}
          className='bg-bg-2 rounded-lg border border-border p-6 w-full max-w-5xl space-y-6'
        >
          <h2 className='text-xl font-semibold text-light'>{mode === 'create' ? 'Create New Role' : 'Edit Role'}</h2>

          {/* Role Name Field */}
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter role name'
                    className='bg-bg-3 border-border text-light placeholder:text-gray'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Permissions Section */}
          <div className='space-y-6'>
            <div className='space-y-1'>
              <FormLabel className='text-base font-semibold text-light'>Permissions</FormLabel>
              {form.formState.errors.permissions && (
                <p className='text-sm text-destructive'>{form.formState.errors.permissions.message}</p>
              )}
            </div>

            {modules.map(module => (
              <div key={module} className='space-y-3'>
                <h3 className='text-base font-medium text-light capitalize border-b border-border pb-2'>{module}</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-2'>
                  {permissions[module]
                    .sort((a, b) => a.id - b.id)
                    .map(permission => (
                      <FormField
                        key={permission.id}
                        control={form.control}
                        name='permissions'
                        render={({ field }) => {
                          return (
                            <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(permission.name)}
                                  onCheckedChange={checked => {
                                    return checked
                                      ? field.onChange([...field.value, permission.name])
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

          {/* Submit Buttons */}
          <div className='flex gap-3 pt-4 border-t border-border'>
            <Button
              type='submit'
              variant='outline'
              disabled={form.formState.isSubmitting}
              className='flex-1 bg-bg-3 text-light disabled:opacity-50'
            >
              {form.formState.isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Role' : 'Update Role'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={form.formState.isSubmitting}
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

export default CreateOrEditRole
