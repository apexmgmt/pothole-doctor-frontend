import { Controller, FieldValues, Path } from 'react-hook-form'

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { FieldComponentProps } from './types'

type SelectFieldProps<T extends FieldValues> = Omit<FieldComponentProps<T>, 'register'>

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
  className = ''
}: SelectFieldProps<T>) => {
  if (!selectOptions) return null

  const renderSelect = (selectedValue: string, setSelectedValue: (nextValue: string) => void) => (
    <Select
      onValueChange={nextValue => {
        setSelectedValue(nextValue)
        onBlur?.(nextValue)
      }}
      value={selectedValue}
    >
      <SelectTrigger disabled={disabled} className={`w-full ${className}`}>
        <SelectValue placeholder={placeholder ?? ''} />
      </SelectTrigger>
      <SelectContent position='popper' className='bg-[#09090B]'>
        {selectOptions.length > 0 && (
          <SelectGroup>
            {selectOptions.map((opt, idx) => (
              <SelectItem
                key={idx}
                value={opt.value}
                disabled={!!opt?.disabled}
                className='py-1 data-[highlighted]:bg-[#1F1F1F]'
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
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
