import { Controller, FieldValues, Path } from 'react-hook-form'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

import { FieldComponentProps } from './types'
import { cn } from '@/lib/utils'

export type CheckboxFieldProps<T extends FieldValues> = Omit<FieldComponentProps<T>, 'register'>

const CheckboxField = <T extends FieldValues>({
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
  labelClassName
}: CheckboxFieldProps<T>) => {
  const checkboxId = typeof name === 'string' ? name : undefined

  const renderCheckbox = (checked: boolean, setChecked: (nextValue: boolean) => void) => (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <Checkbox
        id={checkboxId}
        disabled={disabled}
        autoFocus={autoFocus}
        checked={checked}
        onCheckedChange={nextValue => {
          const isChecked = nextValue === true

          setChecked(isChecked)
          onBlur?.(isChecked)
        }}
      />
      {label && (
        <Label htmlFor={checkboxId} className={cn('text-sm font-normal text-popover-foreground', labelClassName)}>
          {label}
        </Label>
      )}
    </div>
  )

  if (!control || !name) {
    return renderCheckbox(Boolean(value), nextValue => {
      onChange?.(nextValue)
    })
  }

  return (
    <Controller
      name={name as Path<T>}
      control={control}
      rules={rules}
      render={({ field }) =>
        renderCheckbox(Boolean(field.value ?? value), nextValue => {
          field.onChange(nextValue)
          onChange?.(nextValue)
        })
      }
    />
  )
}

export default CheckboxField
