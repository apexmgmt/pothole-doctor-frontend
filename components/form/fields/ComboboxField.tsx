import { useState } from 'react'
import { Controller, FieldValues, Path } from 'react-hook-form'

import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { FieldComponentProps } from './types'

type ComboboxFieldProps<T extends FieldValues> = Omit<FieldComponentProps<T>, 'register'>

const ComboboxField = <T extends FieldValues>({
  name,
  placeholder,
  control,
  rules,
  selectOptions,
  value,
  onChange,
  onBlur,
  className = ''
}: ComboboxFieldProps<T>) => {
  const [open, setOpen] = useState(false)

  if (!selectOptions) return null

  const renderCombobox = (selectedValue: string | undefined, setSelectedValue: (nextValue: string) => void) => (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          onClick={e => e.stopPropagation()}
          className={`w-full justify-between ${
            selectedValue ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'
          } ${className}`}
        >
          {selectedValue ? selectOptions.find(o => o.value === selectedValue)?.label : placeholder}
          <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        onWheel={e => e.stopPropagation()}
        align='start'
        className='p-0'
        style={{ width: 'var(--radix-popover-trigger-width)' }}
      >
        <Command>
          <CommandInput placeholder='Search...' />
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandList className='[scrollbar-width:thin]'>
            <CommandGroup>
              {selectOptions.map(opt => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => {
                    setSelectedValue(opt.value)
                    onBlur?.(opt.value)
                    setOpen(false)
                  }}
                >
                  <Check className={cn('mr-2 size-4', selectedValue === opt.value ? 'opacity-100' : 'opacity-0')} />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )

  if (!control || !name) {
    return renderCombobox(String(value ?? '') || undefined, nextValue => {
      onChange?.(nextValue)
    })
  }

  return (
    <Controller
      name={name as Path<T>}
      control={control}
      rules={rules}
      render={({ field }) =>
        renderCombobox(String(field.value ?? value ?? '') || undefined, nextValue => {
          field.onChange(nextValue)
          onChange?.(nextValue)
        })
      }
    />
  )
}

export default ComboboxField
