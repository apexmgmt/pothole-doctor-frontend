import { useState } from 'react'
import { Controller, FieldValues, Path } from 'react-hook-form'

import { ChevronsUpDown, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { FieldComponentProps } from './types'

type MultiSelectSearchFieldProps<T extends FieldValues> = Omit<FieldComponentProps<T>, 'register'>

const MultiSelectSearchField = <T extends FieldValues>({
  name,
  placeholder,
  control,
  rules,
  selectOptions,
  value,
  onChange,
  onBlur,
  className
}: MultiSelectSearchFieldProps<T>) => {
  const [open, setOpen] = useState(false)

  if (!selectOptions) return null

  const renderMultiSelect = (selectedValues: string[], setSelectedValues: (nextValue: string[]) => void) => {
    const handleToggle = (option: string) => {
      let nextValue = [...selectedValues]

      if (nextValue.includes(option)) {
        nextValue = nextValue.filter(v => v !== option)
      } else {
        nextValue = [...nextValue, option]
      }

      setSelectedValues(nextValue)
      onBlur?.(nextValue)
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' className={`w-full h-auto! justify-between ${className ?? ''}`}>
            <div className='flex flex-1 flex-wrap items-center gap-1 text-left'>
              {!(selectedValues.length > 0) ? (
                <span className='text-muted-foreground'>{placeholder}</span>
              ) : (
                selectedValues.map((valueItem, i) => (
                  <span
                    key={`${valueItem}-${i}`}
                    className='flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-sm text-white/80 bg-muted-background/80'
                  >
                    {selectOptions?.find(opt => opt.value === valueItem)?.label}
                    <span
                      onClick={event => {
                        event.stopPropagation()
                        handleToggle(valueItem)
                      }}
                      className='p-1 hover:text-red-500 hover:bg-white/20 rounded-sm cursor-pointer'
                    >
                      <XIcon className='size-4' />
                    </span>
                  </span>
                ))
              )}
            </div>
            <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>

        <PopoverContent align='start' className='p-0' style={{ width: 'var(--radix-popover-trigger-width)' }}>
          <Command>
            <CommandInput placeholder='Search...' />
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandList className='[scrollbar-width:thin]'>
              <CommandGroup>
                {selectOptions.map(opt => (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    disabled={!!opt.disabled}
                    onSelect={() => handleToggle(opt.value)}
                    className='flex items-center gap-2'
                  >
                    <Checkbox checked={selectedValues.includes(opt.value) ?? false} className='pointer-events-none' />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  if (!control || !name) {
    const selectedValues: string[] = Array.isArray(value) ? value : []

    return renderMultiSelect(selectedValues, nextValue => {
      onChange?.(nextValue)
    })
  }

  return (
    <Controller
      name={name as Path<T>}
      control={control}
      rules={rules}
      render={({ field }) => {
        const selectedValues: string[] = Array.isArray(field.value) ? field.value : []

        return renderMultiSelect(selectedValues, nextValue => {
          field.onChange(nextValue)
          onChange?.(nextValue)
        })
      }}
    />
  )
}

export default MultiSelectSearchField
