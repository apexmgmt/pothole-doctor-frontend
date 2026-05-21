import { useMemo, useRef } from 'react'
import { Control, Controller, FieldErrors, FieldValues, Path, RegisterOptions } from 'react-hook-form'

import { Autocomplete } from '@react-google-maps/api'

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useGoogleMaps } from '@/hocs/GoogleMapProvider'

type PlaceData = {
  city?: string
  state?: string
  country?: string
  postalCode?: string
}

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
  onPlaceSelect?: (data: PlaceData) => void
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
  const { isLoaded } = useGoogleMaps()
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const getComponent = (components: google.maps.GeocoderAddressComponent[], type: string) => {
    return components.find(c => c.types.includes(type))?.long_name
  }

  const handlePlaceChanged = (onChange: (val: string) => void) => {
    const place = autocompleteRef.current?.getPlace()

    if (!place || !place.address_components) return

    const components = place.address_components

    const city =
      getComponent(components, 'locality') ||
      getComponent(components, 'postal_town') ||
      getComponent(components, 'administrative_area_level_2')

    const state = getComponent(components, 'administrative_area_level_1')
    const country = getComponent(components, 'country')
    const postalCode = getComponent(components, 'postal_code')

    const result: PlaceData = {
      city,
      state,
      country,
      postalCode
    }

    if (place.formatted_address) {
      onChange(place.formatted_address)
    }

    onPlaceSelect?.(result)
  }

  // Memoize autocomplete options to prevent unnecessary re-renders
  const autocompleteOptions = useMemo(
    () => ({
      types,
      fields: ['address_components', 'formatted_address', 'geometry'],
      ...(country ? { componentRestrictions: { country } } : {})
    }),
    [types, country]
  )

  const inputStyle = cn(
    `text-sm font-normal leading-none bg-[#1f1f1f] hover:bg-[#1f1f1f] placeholder:text-[#a7a7ae] text-[#f4f4f5] px-2.5 py-2 h-7! ${errors?.[name] ? 'border-red-500' : ''}`,
    className
  )

  return (
    <Field orientation={orientation} className={cn('gap-2', fieldClassName)}>
      {/* Label */}
      {label && (
        <FieldLabel htmlFor={name} className={cn('text-xs font-normal leading-tight', labelClassName)}>
          {label}
          {rules?.required && <span className='text-red-500'>*</span>}
        </FieldLabel>
      )}

      <div>
        {isLoaded ? (
          <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => (
              <Autocomplete
                onLoad={ac => (autocompleteRef.current = ac)}
                onPlaceChanged={() => handlePlaceChanged(field.onChange)}
                options={autocompleteOptions}
              >
                <div onMouseDown={e => e.stopPropagation()}>
                  <Input
                    {...field}
                    type='text'
                    id={name}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    autoComplete='off'
                    onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                    className={inputStyle}
                  />
                </div>
              </Autocomplete>
            )}
          />
        ) : (
          <Input disabled placeholder='Loading address...' className={inputStyle} />
        )}

        {/* Error */}
        {errors?.[name] && <FieldError className='mt-1'>{String(errors?.[name]?.message) ?? ''}</FieldError>}
        {/* Description */}
        {description && <FieldDescription className='mt-1'>{description}</FieldDescription>}
      </div>
    </Field>
  )
}

export default GooglePlaceField
