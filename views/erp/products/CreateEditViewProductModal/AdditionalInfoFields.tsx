'use client'

import { ReactNode } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormFieldType } from '.'

interface AdditionalInfoFieldsProps {
  form: UseFormReturn<any>
  renderFormField: (field: FormFieldType) => ReactNode
}

export function AdditionalInfoFields({ form, renderFormField }: AdditionalInfoFieldsProps) {
  const fields: FormFieldType[] = [
    {
      name: 'is_notify',
      type: 'switch',
      label: 'Notify',
      onChange: (value: any) => {
        form.setValue('is_notify', value ? 1 : 0, { shouldDirty: true })
      }
    },
    {
      name: 'visible',
      type: 'switch',
      label: 'Visible',
      onChange: (value: any) => {
        form.setValue('visible', value ? 1 : 0, { shouldDirty: true })
      }
    },
    {
      name: 'is_freight_percentage',
      type: 'switch',
      label: 'Freight Percentage?',
      onChange: (value: any) => {
        form.setValue('is_freight_percentage', value ? 1 : 0, { shouldDirty: true })
      }
    },
    {
      name: 'freight_amount',
      type: 'number',
      label: `Freight ${form.watch('is_freight_percentage') === 1 ? 'Percentage' : 'Amount'}`,
      placeholder: 'Enter freight amount'
    },
    {
      name: 'is_discontinued_product',
      type: 'switch',
      label: 'Discontinued Product',
      onChange: (value: any) => {
        form.setValue('is_discontinued_product', value ? 1 : 0, { shouldDirty: true })
      }
    },
    {
      name: 'comments',
      type: 'textarea',
      label: 'Comments',
      placeholder: 'Enter comments'
    }
  ]

  return <div className='flex flex-col gap-y-2'>{fields.map(renderFormField)}</div>
}
