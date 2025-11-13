'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import CompanyService from '@/services/api/company.service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { SpinnerCustom } from '@/components/ui/spinner'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'

type FormValues = {
  first_name: string
  last_name: string
  email: string
  phone: string
  user_type: string
  password: string
  password_confirmation: string
  subdomain: string
  address: string
}

const defaultValues: FormValues = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  user_type: 'organization',
  password: '',
  password_confirmation: '',
  subdomain: '',
  address: ''
}

const CreateCompany: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const form = useForm<FormValues>({ defaultValues, mode: 'onSubmit' })
  const { handleSubmit, control, getValues, reset, formState } = form
  const { isSubmitting } = formState
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    dispatch(setPageTitle('Manage Companies'))
  }, [])

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      CompanyService.store(data)
        .then(response => {
          setIsLoading(false)
          toast.success('Company created successfully')
          router.push('/erp/companies')
          reset()
        })
        .catch(error => {
          toast.error('Failed to create company')
          setIsLoading(false)
        })
    } catch (error) {
      toast.error('Something went wrong!')
      setIsLoading(false)
    }
  }

  const onCancel = () => reset()

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='bg-bg-2 rounded-lg border border-border p-6 w-full max-w-3xl space-y-6 relative'
        >
          {isLoading && <SpinnerCustom />}

          <h2 className='text-xl font-semibold text-light'>Create Company</h2>

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
                      placeholder='company email'
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
              name='subdomain'
              rules={{
                required: 'Required',
                pattern: {
                  // 1-63 chars, lowercase letters, numbers, hyphens; cannot start/end with hyphen
                  value: /^(?=.{1,63}$)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
                  message: 'Invalid subdomain. Use lowercase letters, numbers, and hyphens only.'
                }
              }}
              render={({ field }) => (
                <FormItem className='col-span-2'>
                  <FormLabel>Subdomain</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g. acme'
                      className='bg-bg-3 border-border text-light placeholder:text-gray'
                      autoComplete='off'
                      spellCheck={false}
                      {...field}
                      onChange={e => {
                        const sanitized = e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, '') // remove spaces
                          .replace(/[^a-z0-9-]/g, '') // keep only allowed chars
                          .replace(/-+/g, '-') // collapse multiple hyphens
                          .replace(/^-+/, '') // no leading hyphen
                          .replace(/-+$/, '') // no trailing hyphen
                          .slice(0, 63) // max label length
                        field.onChange(sanitized)
                      }}
                    />
                  </FormControl>
                  <p className='text-xs text-gray'>Lowercase letters, numbers, and hyphens only. Max 63 characters.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name='password'
              rules={{ required: 'Required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
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
                required: 'Required',
                validate: (value: string) => value === getValues('password') || 'Does not match'
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
          </div>

          <div className='flex gap-3 pt-4 border-t border-border'>
            <Button
              type='submit'
              variant='outline'
              disabled={isLoading}
              className='flex-1 bg-bg-3 text-light disabled:opacity-50'
            >
              {isLoading ? 'Saving...' : 'Create'}
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

export default CreateCompany
