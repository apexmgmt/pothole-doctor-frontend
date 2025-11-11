'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import CompanyService from '@/services/api/company.service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { SpinnerCustom } from '@/components/ui/spinner'

type FormValues = {
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
}

const defaultValues: FormValues = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: ''
}

const EditCompany: React.FC<{ companyDetails: any }> = ({ companyDetails }) => {
  const router = useRouter()

  // Map companyDetails to form values, pulling address and phone from userable
  const mappedDefaults: FormValues = {
    first_name: companyDetails.first_name || '',
    last_name: companyDetails.last_name || '',
    email: companyDetails.email || '',
    phone: companyDetails.userable?.phone || '',
    address: companyDetails.userable?.address || ''
  }

  const form = useForm<FormValues>({ defaultValues: mappedDefaults, mode: 'onSubmit' })
  const { handleSubmit, control, getValues, reset, formState } = form
  const { isSubmitting } = formState
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      CompanyService.update(companyDetails.id, data)
        .then(response => {
          setIsLoading(false)
          toast.success('Company updated successfully')
          router.push('/erp/companies')
          reset()
        })
        .catch(error => {
          toast.error('Failed to update company')
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

          <h2 className='text-xl font-semibold text-light'>Edit Company</h2>

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
              className='flex-1 bg-bg-3 text-light hover:bg-bg-4 disabled:opacity-50'
            >
              {isLoading ? 'Saving...' : 'Create'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isLoading}
              className='flex-1 border-border text-light hover:bg-bg-3 disabled:opacity-50'
            >
              Reset
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default EditCompany
