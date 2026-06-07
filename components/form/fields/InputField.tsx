import { useState } from 'react'
import { FieldValues, Path } from 'react-hook-form'

import { Eye, EyeOff } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

import { FieldComponentProps } from './types'

export type InputFieldProps<T extends FieldValues> = Omit<FieldComponentProps<T>, 'register'>

const InputField = <T extends FieldValues>({
  type,
  name,
  label,
  placeholder,
  register,
  rules,
  readonly,
  value,
  onChange,
  onBlur,
  autoFocus,
  disabled = false,
  className = '',
  leftAddon,
  rightAddon
}: FieldComponentProps<T>) => {
  const [showPassword, setShowPassword] = useState(false)

  const registeredProps =
    name && register
      ? register(name as Path<T>, {
          ...rules,
          min:
            type === 'number'
              ? {
                  value: 0,
                  message: `${label ?? 'Value'} can't be negative`
                }
              : undefined,
          pattern:
            rules?.pattern ||
            (type === 'email'
              ? {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address'
                }
              : undefined)
        } as any)
      : undefined

  const inputProps = {
    type: type !== 'password' ? type : showPassword ? 'text' : type,
    id: typeof name === 'string' ? name : undefined,
    name: typeof name === 'string' ? name : undefined,
    disabled,
    step: 'any',
    placeholder,
    autoFocus,
    ...registeredProps,
    value: value as string | number | readonly string[] | undefined,
    onChange: (e: any) => {
      registeredProps?.onChange(e)
      onChange?.(e.target.value)
    },
    onBlur: (e: any) => {
      registeredProps?.onBlur(e)
      onBlur?.()
    },
    readOnly: readonly,
  }

  if (leftAddon || rightAddon) {
    return (
      <div className='relative'>
        <InputGroup className={className}>
          {leftAddon && <InputGroupAddon align='inline-start' className='pl-2 text-zinc-400'>{leftAddon}</InputGroupAddon>}
          <InputGroupInput {...inputProps} className='px-2 h-full' />
          {rightAddon && <InputGroupAddon align='inline-end' className='pr-2 text-zinc-400'>{rightAddon}</InputGroupAddon>}
        </InputGroup>
      </div>
    )
  }

  return (
    <div className='relative'>
      <Input
        type={type !== 'password' ? type : showPassword ? 'text' : type}
        id={name}
        name={typeof name === 'string' ? name : undefined}
        disabled={disabled}
        step='any'
        placeholder={placeholder}
        autoFocus={autoFocus}
        {...registeredProps}
        value={value as string | number | readonly string[] | undefined}
        onChange={e => {
          registeredProps?.onChange(e)
          onChange?.(e.target.value)
        }}
        onBlur={e => {
          registeredProps?.onBlur(e)
          onBlur?.()
        }}
        readOnly={readonly}
        className={className}
      />

      {type === 'password' && (
        <button
          type='button'
          onClick={() => setShowPassword(show => !show)}
          className='absolute right-3 bottom-1/2 translate-y-1/2'
        >
          {showPassword ? <Eye className='w-4' /> : <EyeOff className='w-4' />}
        </button>
      )}
    </div>
  )
}

export default InputField
