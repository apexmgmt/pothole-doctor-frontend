'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import AuthService from '@/services/api/auth.service'
import { ProfileDetailsPayload, User } from '@/types'
import { toast } from 'sonner'
import { useAppDispatch } from '@/lib/hooks'
import { setUserData } from '@/lib/features/auth/authSlice'

interface UpdateProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userData: User
}

interface FormValues {
  first_name: string
  last_name: string
  phone: string
  address: string
}

const UpdateProfileModal = ({ open, onOpenChange, userData }: UpdateProfileModalProps) => {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    defaultValues: {
      first_name: userData?.first_name || '',
      last_name: userData?.last_name || '',
      phone: userData?.userable?.phone || '',
      address: userData?.userable?.address || ''
    }
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)

    const payload: ProfileDetailsPayload = {
      first_name: values.first_name,
      last_name: values.last_name,
      phone: values.phone,
      address: values.address
    }

    try {
      await AuthService.updateProfileDetails(payload)

      // Update Redux state
      const updatedUser = {
        ...userData,
        first_name: values.first_name,
        last_name: values.last_name,
        name: `${values.first_name} ${values.last_name}`,
        userable: {
          ...userData.userable,
          phone: values.phone,
          address: values.address
        }
      } as User

      dispatch(setUserData(updatedUser))
      toast.success('Profile updated successfully')
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    form.reset({
      first_name: userData?.first_name || '',
      last_name: userData?.last_name || '',
      phone: userData?.userable?.phone || '',
      address: userData?.userable?.address || ''
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Updating profile...'
      open={open}
      onOpenChange={onOpenChange}
      title='Update Profile'
      description='Update your personal information'
      maxWidth='2xl'
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
            {form.formState.isSubmitting ? 'Saving...' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* First Name Field */}
            <FormField
              control={form.control}
              name='first_name'
              rules={{ required: 'First name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    First Name <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter first name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name Field */}
            <FormField
              control={form.control}
              name='last_name'
              rules={{ required: 'Last name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Last Name <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter last name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Email Field (Read Only) */}
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input value={userData?.email || ''} disabled className='bg-muted cursor-not-allowed' />
              </FormControl>
            </FormItem>

            {/* Phone Field */}
            <FormField
              control={form.control}
              name='phone'
              rules={{
                required: 'Phone is required',
                pattern: {
                  value: /^[0-9+\-\s()]+$/,
                  message: 'Invalid phone number'
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter phone number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address Field */}
          <FormField
            control={form.control}
            name='address'
            rules={{ required: 'Address is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Address <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder='Enter full address' {...field} />
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

export default UpdateProfileModal
