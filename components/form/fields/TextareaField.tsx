import { FieldValues, Path } from 'react-hook-form'

import { Textarea } from '@/components/ui/textarea'

import { FieldComponentProps } from './types'

const TextareaField = <T extends FieldValues>({
  name,
  placeholder,
  register,
  rules,
  readonly,
  value,
  onChange,
  onBlur,
  autoFocus,
  disabled = false,
  className = ''
}: FieldComponentProps<T>) => {
  const registeredProps = name && register ? register(name as Path<T>, rules) : undefined

  const formattedValue = String(value ?? '') || undefined

  return (
    <Textarea
      id={name}
      name={typeof name === 'string' ? name : undefined}
      disabled={disabled}
      placeholder={placeholder}
      autoFocus={autoFocus}
      {...registeredProps}
      value={formattedValue}
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
  )
}

export default TextareaField
