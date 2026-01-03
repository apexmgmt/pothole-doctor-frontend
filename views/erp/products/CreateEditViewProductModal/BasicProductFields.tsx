'use client'

import { UseFormReturn } from 'react-hook-form'

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, MultiSelect } from '@/components/ui/select'

import { Checkbox } from '@/components/ui/checkbox'
import { ProductCategory, ServiceType, Vendor } from '@/types'
import { DatePicker } from '@/components/ui/datePicker'

interface BasicProductFieldsProps {
  form: UseFormReturn<any>
  vendors: Vendor[]
  productCategories: ProductCategory[]
  serviceTypes: ServiceType[]
  disabled?: boolean
}

export function BasicProductFields({
  form,
  vendors,
  productCategories,
  serviceTypes,
  disabled = false
}: BasicProductFieldsProps) {
  return (
    <div className='space-y-4'>
      {/* Vendor Field */}
      <FormField
        control={form.control}
        name='vendor_id'
        rules={{ required: 'Vendor is required' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Vendor <span className='text-red-500'>*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Vendor' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {vendors.length > 0 &&
                  vendors.map(vendor => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.first_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category Field */}
      <FormField
        control={form.control}
        name='category_id'
        rules={{ required: 'Category is required' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Category <span className='text-red-500'>*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Product Category' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {productCategories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Service Types Field */}
      <FormField
        control={form.control}
        name='service_type_id'
        rules={{ 
          required: 'Service type is required',
          validate: (value) => (value && value.length > 0) || 'At least one service type must be selected'
         }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Associated Services <span className='text-red-500'>*</span></FormLabel>
            <FormControl>
              <MultiSelect
                options={serviceTypes.map(st => ({
                  value: st.id.toString(),
                  label: st.name
                }))}
                selected={field.value || []}
                onChange={field.onChange}
                placeholder='Select service types'
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Is Rolled Good Checkbox */}
      <FormField
        control={form.control}
        name='is_rolled_good'
        render={({ field }) => (
          <FormItem className='flex flex-row items-center gap-2'>
            <FormControl>
              <Checkbox
                checked={!!field.value}
                onCheckedChange={checked => field.onChange(checked ? 1 : 0)}
                id='is_rolled_good'
                disabled={disabled}
              />
            </FormControl>
            <FormLabel htmlFor='is_rolled_good' className='mb-0 cursor-pointer'>
              Is Rolled Good
            </FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* SKU Field */}
      <FormField
        control={form.control}
        name='sku'
        render={({ field }) => (
          <FormItem>
            <FormLabel>SKU</FormLabel>
            <FormControl>
              <Input placeholder='Enter SKU' {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Vendor Product Name Field */}
      <FormField
        control={form.control}
        name='vendor_product_name'
        rules={{ required: 'Vendor product name is required' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Vendor Product Name <span className='text-red-500'>*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder='Enter vendor product name'
                {...field}
                onChange={e => {
                  field.onChange(e)
                  const privateName = form.getValues('private_product_name')

                  // If private_product_name is empty or same as previous vendor_product_name, update it
                  if (!privateName || privateName === field.value) {
                    form.setValue('private_product_name', e.target.value)
                  }
                }}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className='grid grid-cols-2 gap-4'>
        {/* Vendor Style Field */}
        <FormField
          control={form.control}
          name='vendor_style'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor Style</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter vendor style'
                  {...field}
                  onChange={e => {
                    field.onChange(e)
                    const privateStyle = form.getValues('private_style')

                    // If private_style is empty or same as previous vendor_style, update it
                    if (!privateStyle || privateStyle === field.value) {
                      form.setValue('private_style', e.target.value)
                    }
                  }}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Vendor Color Field */}
        <FormField
          control={form.control}
          name='vendor_color'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor Color</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter vendor color'
                  {...field}
                  onChange={e => {
                    field.onChange(e)
                    const privateColor = form.getValues('private_color')

                    // If private_color is empty or same as previous vendor_color, update it
                    if (!privateColor || privateColor === field.value) {
                      form.setValue('private_color', e.target.value)
                    }
                  }}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* Private Product Name Field */}
      <FormField
        control={form.control}
        name='private_product_name'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Private Prod. Name</FormLabel>
            <FormControl>
              <Input placeholder='Enter private product name' {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className='grid grid-cols-2 gap-4'>
        {/* Private Style Field */}
        <FormField
          control={form.control}
          name='private_style'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Private Style</FormLabel>
              <FormControl>
                <Input placeholder='Enter private style' {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Private Color Field */}
        <FormField
          control={form.control}
          name='private_color'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Private Color</FormLabel>
              <FormControl>
                <Input placeholder='Enter private color' {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* Collection Field */}
      <FormField
        control={form.control}
        name='collection'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Collection</FormLabel>
            <FormControl>
              <Input placeholder='Enter collection' {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className='grid grid-cols-2 gap-4'>
        {/* Dropped Date Field */}
        <FormField
          control={form.control}
          name='dropped_date'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dropped Date</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value ? new Date(field.value) : null}
                  onChange={val => {
                    field.onChange(val ? val.toISOString().slice(0, 10) : '')
                  }}
                  placeholder='Select date'
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* Size/Description Field */}
      <FormField
        control={form.control}
        name='description'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Size/Description</FormLabel>
            <FormControl>
              <Textarea rows={3} placeholder='Enter description' {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
