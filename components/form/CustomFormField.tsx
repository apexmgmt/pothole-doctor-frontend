import { ReactNode } from 'react'
import { FieldErrors, FieldValues, Path } from 'react-hook-form'

import { cn } from '@/lib/utils'

import ComboboxField from '@/components/form/fields/ComboboxField'
import InputField from '@/components/form/fields/InputField'
import SelectField from '@/components/form/fields/SelectField'
import { BaseFieldProps } from '@/components/form/fields/types'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'

import DatePicker from './fields/DatePicker'
import TextareaField from './fields/TextareaField'
import MultiSelectField from './fields/MultiSelectField'
import MultiSelectSearchField from './fields/MultiSelectSearchField'
import CheckboxField from './fields/CheckboxField'

type FormFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
  orientation?: 'horizontal' | 'vertical'
  minDate?: string
  maxDate?: string
  lockFutureDate?: boolean
  description?: ReactNode
  errors?: FieldErrors<T>
}

const CustomFormField = <T extends FieldValues>({
  type = 'text',
  name,
  label,
  orientation = 'vertical',
  placeholder = '',
  description,
  register,
  rules,
  selectOptions = [],
  control,
  errors,
  readonly = false,
  minDate,
  maxDate,
  lockFutureDate,
  value,
  onChange,
  onBlur,
  className = '',
  labelClassName = '',
  fieldClassName = ''
}: FormFieldProps<T>) => {
  const fieldError = name ? errors?.[name as Path<T>] : undefined

  // Combine base styles
  const inputStyle = cn(
    `text-sm font-normal leading-none bg-[#1f1f1f] hover:bg-[#1f1f1f] placeholder:text-[#a7a7ae] text-[#f4f4f5] px-2.5 py-2 ${type === 'textarea' ? 'h-16!' : 'h-7!'} ${fieldError ? 'border-red-500' : ''}`,
    className
  )

  const isCheckbox = type === 'checkbox'

  return (
    <Field orientation={orientation} className={cn('gap-2', fieldClassName)}>
      {/* Label */}
      {label && !isCheckbox && (
        <FieldLabel htmlFor={name} className={cn('text-xs font-normal leading-tight gap-0', labelClassName)}>
          {label}
          {rules?.required && <span className='text-sm text-red-500'>*</span>}
        </FieldLabel>
      )}

      <div>
        {type === 'combobox' ? (
          <ComboboxField
            name={name}
            placeholder={placeholder}
            control={control}
            rules={rules}
            selectOptions={selectOptions}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={inputStyle}
          />
        ) : type === 'select' ? (
          <SelectField
            name={name}
            placeholder={placeholder}
            control={control}
            rules={rules}
            selectOptions={selectOptions}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={inputStyle}
          />
        ) : type === 'multiselect' ? (
          <MultiSelectField
            name={name}
            placeholder={placeholder}
            selectOptions={selectOptions}
            value={value}
            rules={rules}
            control={control}
            onChange={onChange}
            onBlur={onBlur}
            className={inputStyle}
          />
        ) : type === 'multiselect-searchable' ? (
          <MultiSelectSearchField
            name={name}
            placeholder={placeholder}
            selectOptions={selectOptions}
            value={value}
            rules={rules}
            control={control}
            onChange={onChange}
            onBlur={onBlur}
            className={inputStyle}
          />
        ) : type === 'checkbox' ? (
          <CheckboxField
            name={name}
            label={label}
            value={value}
            rules={rules}
            control={control}
            onChange={onChange}
            onBlur={onBlur}
            className={className}
            labelClassName={labelClassName}
          />
        ) : type === 'datepicker' ? (
          <DatePicker
            name={name}
            placeholder={placeholder}
            control={control}
            minDate={minDate}
            maxDate={maxDate}
            rules={rules}
            lockFutureDate={lockFutureDate}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={inputStyle}
          />
        ) : type === 'textarea' ? (
          <TextareaField
            name={name}
            placeholder={placeholder}
            register={register}
            rules={rules}
            readonly={readonly}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={inputStyle}
          />
        ) : (
          <InputField
            type={type}
            name={name}
            label={label}
            placeholder={placeholder}
            register={register}
            rules={rules}
            readonly={readonly}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={inputStyle}
          />
        )}

        {/* Error */}
        {fieldError && <FieldError className='mt-1'>{String(fieldError?.message) ?? ''}</FieldError>}
        {/* Description */}
        {description && <FieldDescription className='mt-1'>{description}</FieldDescription>}
      </div>
    </Field>
  )
}

export default CustomFormField
