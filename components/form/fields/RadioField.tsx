import { Controller, FieldValues, Path } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import { FieldComponentProps } from './types'
import { cn } from '@/lib/utils'

export type RadioFieldProps<T extends FieldValues> = Omit<FieldComponentProps<T>, 'register'>

const RadioField = <T extends FieldValues>({
  name,
  selectOptions,
  control,
  rules,
  disabled = false,
  value,
  onChange,
  onBlur,
  autoFocus,
  className = ''
}: RadioFieldProps<T>) => {
  if (!selectOptions) return null

  const renderRadioGroup = (selectedValue: string, setSelectedValue: (nextValue: string) => void) => (
    <RadioGroup
      value={selectedValue}
      onValueChange={nextValue => {
        setSelectedValue(nextValue)
        onBlur?.(nextValue)
      }}
      className={cn('flex gap-2', className)}
      disabled={disabled}
    >
      {selectOptions.map((option, idx) => {
        const radioId = `${String(name ?? 'radio')}-${idx}`

        return (
          <div key={radioId} className='flex items-center gap-x-2'>
            <RadioGroupItem
              value={option.value}
              id={radioId}
              disabled={disabled || option.disabled}
              autoFocus={autoFocus && idx === 0}
            />
            <Label htmlFor={radioId} className='cursor-pointer text-xs! font-normal! text-popover-foreground!   '>
              {option.label}
            </Label>
          </div>
        )
      })}
    </RadioGroup>
  )

  if (!control || !name) {
    return renderRadioGroup(String(value ?? ''), nextValue => {
      onChange?.(nextValue)
    })
  }

  return (
    <Controller
      name={name as Path<T>}
      control={control}
      rules={rules}
      render={({ field }) =>
        renderRadioGroup(String(field.value ?? value ?? ''), nextValue => {
          field.onChange(nextValue)
          onChange?.(nextValue)
        })
      }
    />
  )
}

export default RadioField
