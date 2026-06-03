'use client'

import { UseFormReturn } from 'react-hook-form'

import { ProductCategory, ServiceType, Vendor } from '@/types'
import { FormFieldType } from '.'
import { ReactNode } from 'react'

interface BasicProductFieldsProps {
  form: UseFormReturn<any>
  vendors: Vendor[]
  productCategories: ProductCategory[]
  serviceTypes: ServiceType[]
  renderFormField: (field: FormFieldType) => ReactNode
}

export function BasicProductFields({
  form,
  vendors,
  productCategories,
  serviceTypes,
  renderFormField
}: BasicProductFieldsProps) {
  const basicProductFields: FormFieldType[] = [
    {
      name: 'vendor_id',
      type: 'select',
      label: 'Vendor',
      placeholder: 'Select a vendor',
      rules: { required: 'Vendor is required' },
      selectOptions: vendors.map(vendor => ({ label: vendor.first_name, value: vendor.id.toString() }))
    },
    {
      name: 'category_id',
      type: 'combobox',
      label: 'Category',
      placeholder: 'Select product category',
      rules: { required: 'Category is required' },
      selectOptions: productCategories.map(category => ({ label: category.name, value: category.id.toString() }))
    },
    {
      name: 'service_type_id',
      type: 'multiselect-searchable',
      label: 'Associated Services',
      placeholder: 'Select service types',
      selectOptions: serviceTypes.map(st => ({ label: st.name, value: st.id.toString() }))
    },
    {
      name: 'is_rolled_good',
      type: 'checkbox',
      label: 'Is Rolled Good',
      onChange: (value: boolean) => {
        form.setValue('is_rolled_good', value ? 1 : 0, { shouldDirty: true })
      }
    },
    {
      name: 'sku',
      type: 'text',
      label: 'SKU',
      placeholder: 'Enter SKU',
      rules: { required: 'SKU is required' }
    },
    {
      name: 'vendor_product_name',
      type: 'text',
      label: 'Vendor Product Name',
      placeholder: 'Enter vendor product name',
      rules: { required: 'Vendor product name is required' },
      onChange: (value: string) => {
        const privateName = form.getValues('private_product_name')

        // If private product name is empty, set it to the same as vendor product name
        if (!privateName || privateName === value) {
          form.setValue('private_product_name', value, { shouldDirty: true })
        }
      }
    },
    {
      name: 'vendor_style',
      type: 'text',
      label: 'Vendor Style',
      placeholder: 'Enter vendor style',
      onChange: (value: string) => {
        const privateStyle = form.getValues('private_style')

        // If private style is empty, set it to the same as vendor style
        if (!privateStyle || privateStyle === value) {
          form.setValue('private_style', value, { shouldDirty: true })
        }
      }
    },
    {
      name: 'vendor_color',
      type: 'text',
      label: 'Vendor Color',
      placeholder: 'Enter vendor color',
      onChange: (value: string) => {
        const privateColor = form.getValues('private_color')

        // If private_color is empty or same as previous vendor_color, update it
        if (!privateColor || privateColor === value) {
          form.setValue('private_color', value, { shouldDirty: true })
        }
      }
    },
    {
      name: 'private_product_name',
      type: 'text',
      label: 'Private Prod. Name',
      placeholder: 'Enter private product name'
    },
    {
      name: 'private_style',
      type: 'text',
      label: 'Private Style',
      placeholder: 'Enter private style'
    },
    {
      name: 'private_color',
      type: 'text',
      label: 'Private Color',
      placeholder: 'Enter private color'
    },
    {
      name: 'collection',
      type: 'text',
      label: 'Collection',
      placeholder: 'Enter collection'
    },
    {
      name: 'dropped_date',
      type: 'datepicker',
      label: 'Dropped Date',
      placeholder: 'Select date'
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Size/Description',
      placeholder: 'Enter description'
    }
  ]

  return <div className='flex flex-col gap-y-2'>{basicProductFields.map(renderFormField)}</div>
}
