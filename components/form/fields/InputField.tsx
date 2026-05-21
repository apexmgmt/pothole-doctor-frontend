import { useState } from 'react'
import { FieldValues, Path } from 'react-hook-form'

import { Eye, EyeOff } from 'lucide-react'

import { Input } from '@/components/ui/input'

import { FieldComponentProps } from './types'

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
  disabled = false,
  className = ''
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
              : undefined
        })
      : undefined

  return (
    <div className='relative'>
      <Input
        type={type !== 'password' ? type : showPassword ? 'text' : type}
        id={name}
        name={typeof name === 'string' ? name : undefined}
        disabled={disabled}
        step='any'
        placeholder={placeholder}
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
