import { useEffect, useState } from 'react'
import { Controller, FieldValues, Path } from 'react-hook-form'

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { FieldComponentProps } from './types'

export type SelectFieldProps<T extends FieldValues> = Omit<FieldComponentProps<T>, 'register'>

const SelectField = <T extends FieldValues>({
  name,
  placeholder,
  control,
  rules,
  selectOptions,
  disabled = false,
  value,
  onChange,
  onBlur,
  onOpenChange,
  autoFocus,
  className = ''
}: SelectFieldProps<T>) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (autoFocus && !disabled) {
      setOpen(true)
      onOpenChange?.(true)
    }
  }, [autoFocus, disabled, onOpenChange])

  if (!selectOptions) return null

  const renderSelect = (selectedValue: string, setSelectedValue: (nextValue: string) => void) => (
    <Select
      open={open}
      onOpenChange={nextOpen => {
        setOpen(nextOpen)
        onOpenChange?.(nextOpen)
      }}
      onValueChange={nextValue => {
        setSelectedValue(nextValue)
        onBlur?.(nextValue)
      }}
      value={selectedValue}
    >
      <SelectTrigger disabled={disabled} autoFocus={autoFocus} className={`w-full ${className}`}>
        <SelectValue placeholder={placeholder ?? ''} />
      </SelectTrigger>
      <SelectContent position='popper'>
        <SelectGroup>
          {selectOptions.length < 1 ? (
            <SelectItem value='_' disabled>
              No options available
            </SelectItem>
          ) : (
            selectOptions.map((opt, idx) => (
              <SelectItem key={idx} value={opt.value} disabled={!!opt?.disabled}>
                {opt.labelPrefix && <span className='mr-2'>{opt.labelPrefix}</span>}
                {opt.label}
              </SelectItem>
            ))
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  )

  if (!control || !name) {
    return renderSelect(String(value ?? ''), nextValue => {
      onChange?.(nextValue)
    })
  }

  return (
    <Controller
      name={name as Path<T>}
      control={control}
      rules={rules}
      render={({ field }) =>
        renderSelect(String(field.value ?? value ?? ''), nextValue => {
          field.onChange(nextValue)
          onChange?.(nextValue)
        })
      }
    />
  )
}

export default SelectField
