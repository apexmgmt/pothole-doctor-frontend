import { Control, FieldValues, Path, RegisterOptions, UseFormRegister } from 'react-hook-form'

export type InputType =
  | 'text'
  | 'tel'
  | 'password'
  | 'email'
  | 'number'
  | 'time'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'multiselect-searchable'
  | 'multiselect-creatable'
  | 'checkbox'
  | 'combobox'
  | 'datepicker'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type BaseFieldProps<T extends FieldValues> = {
  type?: InputType
  name?: Path<T> | string
  label?: string
  placeholder?: string
  selectOptions?: SelectOption[]
  value?: unknown
  readonly?: boolean
  disabled?: boolean
  rules?: RegisterOptions<T, Path<T>>
  control?: Control<T>
  register?: UseFormRegister<T>
  onChange?: (value: unknown) => void
  onBlur?: (value?: unknown) => void
  className?: string
  labelClassName?: string
  fieldClassName?: string
}

export type FieldComponentProps<T extends FieldValues> = BaseFieldProps<T>
