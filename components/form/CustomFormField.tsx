import dynamic from 'next/dynamic'

import type { ReactElement, ReactNode } from 'react'
import { FieldErrors, FieldValues, Path } from 'react-hook-form'

import { cn } from '@/lib/utils'

import { BaseFieldProps, FieldComponentProps } from '@/components/form/fields/types'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'

import type { CheckboxFieldProps } from './fields/CheckboxField'
import type { ComboboxFieldProps } from './fields/ComboboxField'
import type { DatePickerProps } from './fields/DatePicker'
import type { MultiSelectCreatableFieldProps } from './fields/MultiSelectCreatableField'
import type { MultiSelectFieldProps } from './fields/MultiSelectField'
import type { MultiSelectSearchFieldProps } from './fields/MultiSelectSearchField'
import type { SelectFieldProps } from './fields/SelectField'

const DynamicFields = {
  SelectField: dynamic(() => import('./fields/SelectField')) as <T extends FieldValues>(
    props: SelectFieldProps<T>
  ) => ReactElement,
  ComboboxField: dynamic(() => import('./fields/ComboboxField')) as <T extends FieldValues>(
    props: ComboboxFieldProps<T>
  ) => ReactElement,
  MultiSelectField: dynamic(() => import('./fields/MultiSelectField')) as <T extends FieldValues>(
    props: MultiSelectFieldProps<T>
  ) => ReactElement,
  MultiSelectSearchField: dynamic(() => import('./fields/MultiSelectSearchField')) as <T extends FieldValues>(
    props: MultiSelectSearchFieldProps<T>
  ) => ReactElement,
  MultiSelectCreatableField: dynamic(() => import('./fields/MultiSelectCreatableField')) as <T extends FieldValues>(
    props: MultiSelectCreatableFieldProps<T>
  ) => ReactElement,
  DatePicker: dynamic(() => import('./fields/DatePicker')) as <T extends FieldValues>(
    props: DatePickerProps<T>
  ) => ReactElement,
  TextareaField: dynamic(() => import('./fields/TextareaField')) as <T extends FieldValues>(
    props: FieldComponentProps<T>
  ) => ReactElement,
  InputField: dynamic(() => import('./fields/InputField')) as <T extends FieldValues>(
    props: FieldComponentProps<T>
  ) => ReactElement,
  CheckboxField: dynamic(() => import('./fields/CheckboxField')) as <T extends FieldValues>(
    props: CheckboxFieldProps<T>
  ) => ReactElement
}

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
  disabled = false,
  minDate,
  maxDate,
  lockFutureDate,
  value,
  onChange,
  onBlur,
  onOpenChange,
  autoFocus,
  className = '',
  labelClassName = '',
  fieldClassName = ''
}: FormFieldProps<T>) => {
  const fieldError = name ? errors?.[name as Path<T>] : undefined

  // Combine base styles
  const inputStyle = cn(
    `text-sm font-normal leading-none bg-[#1f1f1f] hover:bg-[#1f1f1f] placeholder:text-[#a7a7ae] text-[#f4f4f5] px-2.5 py-1.25 ${type === 'textarea' ? '' : 'h-7!'} ${fieldError ? 'border-red-500' : ''}`,
    className
  )

  const isCheckbox = type === 'checkbox'

  return (
    <Field orientation={orientation} className={cn('gap-2', fieldClassName)}>
      {/* Label */}
      {label && !isCheckbox && (
        <FieldLabel htmlFor={name} className={cn('text-xs font-normal leading-tight gap-0', labelClassName)}>
          {label}
          {rules?.required && <span className='text-sm leading-none text-red-500'>*</span>}
        </FieldLabel>
      )}

      <div>
        {type === 'combobox' ? (
          <DynamicFields.ComboboxField
            name={name}
            placeholder={placeholder}
            control={control}
            rules={rules}
            selectOptions={selectOptions}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onOpenChange={onOpenChange}
            autoFocus={autoFocus}
            disabled={disabled}
            className={inputStyle}
          />
        ) : type === 'select' ? (
          <DynamicFields.SelectField
            name={name}
            placeholder={placeholder}
            control={control}
            rules={rules}
            selectOptions={selectOptions}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onOpenChange={onOpenChange}
            autoFocus={autoFocus}
            disabled={disabled}
            className={inputStyle}
          />
        ) : type === 'multiselect' ? (
          <DynamicFields.MultiSelectField
            name={name}
            placeholder={placeholder}
            selectOptions={selectOptions}
            value={value}
            rules={rules}
            control={control}
            onChange={onChange}
            onBlur={onBlur}
            onOpenChange={onOpenChange}
            autoFocus={autoFocus}
            disabled={disabled}
            className={inputStyle}
          />
        ) : type === 'multiselect-searchable' ? (
          <DynamicFields.MultiSelectSearchField
            name={name}
            placeholder={placeholder}
            selectOptions={selectOptions}
            value={value}
            rules={rules}
            control={control}
            onChange={onChange}
            onBlur={onBlur}
            onOpenChange={onOpenChange}
            autoFocus={autoFocus}
            disabled={disabled}
            className={inputStyle}
          />
        ) : type === 'multiselect-creatable' ? (
          <DynamicFields.MultiSelectCreatableField
            name={name}
            placeholder={placeholder}
            selectOptions={selectOptions}
            value={value}
            rules={rules}
            control={control}
            onChange={onChange}
            onBlur={onBlur}
            onOpenChange={onOpenChange}
            autoFocus={autoFocus}
            disabled={disabled}
            className={inputStyle}
          />
        ) : type === 'checkbox' ? (
          <DynamicFields.CheckboxField
            name={name}
            label={label}
            value={value}
            rules={rules}
            control={control}
            onChange={onChange}
            onBlur={onBlur}
            autoFocus={autoFocus}
            disabled={disabled}
            className={className}
            labelClassName={labelClassName}
          />
        ) : type === 'datepicker' ? (
          <DynamicFields.DatePicker
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
            autoFocus={autoFocus}
            disabled={disabled}
            className={inputStyle}
          />
        ) : type === 'textarea' ? (
          <DynamicFields.TextareaField
            name={name}
            placeholder={placeholder}
            register={register}
            rules={rules}
            readonly={readonly}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            autoFocus={autoFocus}
            disabled={disabled}
            className={inputStyle}
          />
        ) : (
          <DynamicFields.InputField
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
            autoFocus={autoFocus}
            disabled={disabled}
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
