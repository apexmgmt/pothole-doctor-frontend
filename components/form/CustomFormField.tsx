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
import MultiSelectCreatableField from './fields/MultiSelectCreatableField'
import SwitchField from './fields/SwitchField'

type FormFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
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

  const isHorizontalField = type === 'checkbox' || type === 'switch'

  return (
    <Field orientation={isHorizontalField ? 'horizontal' : undefined} className={cn('gap-2', fieldClassName)}>
      {/* Label */}
      {label && !isHorizontalField && (
        <FieldLabel htmlFor={name} className={cn('text-xs font-normal leading-tight gap-0', labelClassName)}>
          {label}
          {rules?.required && <span className='text-sm leading-none text-red-500'>*</span>}
        </FieldLabel>
      )}

      {/* Checkbox or Switch */}
      {isHorizontalField ? (
        type === 'switch' ? (
          <SwitchField
            name={name}
            label={label}
            value={value}
            rules={rules}
            control={control}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={className}
            labelClassName={labelClassName}
          />
        ) : (
          <CheckboxField
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
        )
      ) : (
        <div>
          {/* Input fields - (except checkbox and switch) */}
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
              onOpenChange={onOpenChange}
              autoFocus={autoFocus}
              disabled={disabled}
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
              onOpenChange={onOpenChange}
              autoFocus={autoFocus}
              disabled={disabled}
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
              onOpenChange={onOpenChange}
              autoFocus={autoFocus}
              disabled={disabled}
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
              onOpenChange={onOpenChange}
              autoFocus={autoFocus}
              disabled={disabled}
              className={inputStyle}
            />
          ) : type === 'multiselect-creatable' ? (
            <MultiSelectCreatableField
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
              autoFocus={autoFocus}
              disabled={disabled}
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
              autoFocus={autoFocus}
              disabled={disabled}
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
      )}
    </Field>
  )
}

export default CustomFormField
