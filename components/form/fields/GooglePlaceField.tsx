import { useRef } from 'react'
import { Control, Controller, FieldErrors, FieldValues, Path, RegisterOptions } from 'react-hook-form'

import { Autocomplete } from '@react-google-maps/api'

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type GooglePlaceFieldProps<T extends FieldValues> = {
  name: Path<T>
  label?: string
  placeholder?: string
  description?: string | React.ReactNode
  errors?: FieldErrors<T>
  country?: string
  types?: string[]
  rules?: RegisterOptions<T, Path<T>>
  control: Control<T>
  onPlaceSelect?: (data: { city?: string; state?: string; postalCode?: string }) => void
  readOnly?: boolean
  orientation?: 'horizontal' | 'vertical'
  className?: string
  labelClassName?: string
  fieldClassName?: string
}

const GooglePlaceField = <T extends FieldValues>({
  name,
  label,
  placeholder,
  description,
  rules,
  errors,
  control,
  onPlaceSelect,
  country = 'us',
  types = ['address'],
  readOnly = false,
  orientation = 'vertical',
  className = '',
  labelClassName = '',
  fieldClassName = ''
}: GooglePlaceFieldProps<T>) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const handlePlaceChanged = (onChange: (val: string) => void) => {
    const place = autocompleteRef.current?.getPlace()

    if (!place || !place.address_components) return

    const mapping: Record<string, string> = {
      locality: 'city',
      administrative_area_level_2: 'city',
      administrative_area_level_1: 'state',
      postal_code: 'postalCode'
    }

    const result: Record<string, string> = {}

    place.address_components.forEach(component => {
      const type = component.types.find(t => mapping[t])

      if (type) {
        result[mapping[type]] = component.long_name
      }
    })

    if (place.formatted_address) {
      onChange(place.formatted_address)
    }

    onPlaceSelect?.(result)
  }

  return (
    <Field orientation={orientation} className={fieldClassName}>
      {/* Label */}
      {label && (
        <FieldLabel htmlFor={name} className={labelClassName}>
          {label}
          {rules?.required && <span className='text-red-500'>*</span>}
        </FieldLabel>
      )}

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <Autocomplete
            onLoad={ac => (autocompleteRef.current = ac)}
            onPlaceChanged={() => handlePlaceChanged(field.onChange)}
            options={{
              types,
              componentRestrictions: { country },
              fields: ['address_components', 'formatted_address']
            }}
          >
            <div onMouseDown={e => e.stopPropagation()}>
              <Input
                {...field}
                type='text'
                id={name}
                placeholder={placeholder}
                readOnly={readOnly}
                onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                className={className}
              />
            </div>
          </Autocomplete>
        )}
      />

      {/* Error */}
      {errors?.[name] && <FieldError>{String(errors?.[name]?.message) ?? ''}</FieldError>}
      {/* Description */}
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  )
}

export default GooglePlaceField
