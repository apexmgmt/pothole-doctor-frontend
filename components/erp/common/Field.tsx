import React, { useMemo, useState, ChangeEvent, FocusEvent } from 'react'
import { FieldError, UseFormRegisterReturn } from 'react-hook-form'
import { EyeCloseIcon, EyeOpenIcon } from '@/public/icons/icons'

type Option = {
  value: string
  label: string
}

type FieldProps = {
  // common
  type?: 'text' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'textarea'
  label?: string
  name?: string
  value?: string | string[] | boolean
  onChange?: (
    e:
      | ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | { target: { name?: string; value: any } }
  ) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void

  // select / radio / checkbox
  options?: Option[]
  // textarea
  rows?: number

  // react-hook-form support
  register?: UseFormRegisterReturn
  error?: FieldError
}

const Field: React.FC<FieldProps> = ({
  type = 'text',
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  onBlur,
  options = [],
  rows = 4,
  register,
  error
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const labelClass = useMemo(() => 'block text-[14px] font-medium text-light-2 font-inter', [])

  const baseFieldClass = useMemo(
    () =>
      [
        'w-full appearance-none outline-none',
        'px-3 py-2 rounded-lg',
        'border',
        error ? 'border-red-500' : 'border-border',
        'bg-bg-2 text-light text-[14px] font-normal font-inter',
        'placeholder:text-gray'
      ].join(' '),
    [error]
  )

  // Helper to split ref from register
  function getInputProps() {
    if (!register) {
      return { value, onChange, required, disabled, placeholder, onBlur, name }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ref, ...rest } = register
    return { ...rest, required, disabled, placeholder, onBlur, name, inputRef: ref }
  }

  const renderTextLike = (resolvedType: string) => {
    if (register) {
      const { ref, ...rest } = register
      return (
        <div className='relative'>
          <input
            type={resolvedType}
            className={baseFieldClass}
            {...rest}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            onBlur={onBlur}
            name={name}
            ref={ref}
          />
          {type === 'password' && (
            <button
              type='button'
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
              className='absolute right-2 top-1/2 -translate-y-1/2 text-gray hover:text-light-2 cursor-pointer'
              tabIndex={-1}
            >
              {showPassword ? EyeCloseIcon : EyeOpenIcon}
            </button>
          )}
        </div>
      )
    }
    return (
      <div className='relative'>
        <input
          type={resolvedType}
          className={baseFieldClass}
          value={typeof value === 'string' || typeof value === 'number' ? value : ''}
          onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          onBlur={onBlur}
          name={name}
        />
        {type === 'password' && (
          <button
            type='button'
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
            className='absolute right-2 top-1/2 -translate-y-1/2 text-gray hover:text-light-2 cursor-pointer'
            tabIndex={-1}
          >
            {showPassword ? EyeCloseIcon : EyeOpenIcon}
          </button>
        )}
      </div>
    )
  }

  const renderSelect = () => {
    if (register) {
      const { ref, ...rest } = register
      return (
        <select
          className={baseFieldClass}
          {...rest}
          required={required}
          disabled={disabled}
        //   placeholder={placeholder}
          onBlur={onBlur}
          name={name}
          ref={ref}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className='text-dark'>
              {opt.label}
            </option>
          ))}
        </select>
      )
    }
    return (
      <select
        className={baseFieldClass}
        value={typeof value === 'string' ? value : ''}
        onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
        required={required}
        disabled={disabled}
        // placeholder={placeholder}
        onBlur={onBlur}
        name={name}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className='text-dark'>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }

  const renderTextarea = () => {
    if (register) {
      const { ref, ...rest } = register
      return (
        <textarea
          rows={rows}
          className={`${baseFieldClass} resize-y`}
          {...rest}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          onBlur={onBlur}
          name={name}
          ref={ref}
        />
      )
    }
    return (
      <textarea
        rows={rows}
        className={`${baseFieldClass} resize-y`}
        value={typeof value === 'string' ? value : ''}
        onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        onBlur={onBlur}
        name={name}
      />
    )
  }

  // Checkbox and radio can be handled similarly if needed

  const content = useMemo(() => {
    if (type === 'textarea') return renderTextarea()
    if (type === 'select') return renderSelect()
    if (type === 'password') return renderTextLike(showPassword ? 'text' : 'password')
    return renderTextLike(type)
  }, [type, showPassword, value, error, options, placeholder, disabled, required, register])

  return (
    <div className='grid gap-2 mb-3'>
      {label ? <label className={labelClass}>{label}</label> : null}
      {content}
      {error && <span className='text-xs text-red-500'>{error.message}</span>}
    </div>
  )
}

export default Field
