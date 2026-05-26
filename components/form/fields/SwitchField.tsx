'use client'

import { Controller, FieldValues, Path } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

import { FieldComponentProps } from './types'

export type SwitchFieldProps<T extends FieldValues> = Omit<FieldComponentProps<T>, 'register'>

const SwitchField = <T extends FieldValues>({
  name,
  label,
  control,
  rules,
  value,
  disabled = false,
  onChange,
  onBlur,
  autoFocus,
  className,
  fieldClassName,
  labelClassName
}: SwitchFieldProps<T>) => {
  const switchId = typeof name === 'string' ? name : undefined

  const renderSwitch = (checked: boolean, setChecked: (nextValue: boolean) => void) => (
    <div className={cn(`flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`, fieldClassName)}>
      <Switch
        id={switchId}
        disabled={disabled}
        autoFocus={autoFocus}
        checked={checked}
        onCheckedChange={nextValue => {
          const isChecked = nextValue === true

          setChecked(isChecked)
          onBlur?.(isChecked)
        }}
        className={className}
      />
      {label && (
        <Label htmlFor={switchId} className={cn('text-sm font-normal text-popover-foreground', labelClassName)}>
          {label}
        </Label>
      )}
    </div>
  )

  if (!control || !name) {
    return renderSwitch(Boolean(value), nextValue => {
      onChange?.(nextValue)
    })
  }

  return (
    <Controller
      name={name as Path<T>}
      control={control}
      rules={rules}
      render={({ field }) =>
        renderSwitch(Boolean(field.value ?? value), nextValue => {
          field.onChange(nextValue)
          onChange?.(nextValue)
        })
      }
    />
  )
}

export default SwitchField
