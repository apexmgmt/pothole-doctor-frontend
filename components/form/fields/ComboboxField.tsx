import { useEffect, useState } from 'react'
import { Controller, FieldValues, Path } from 'react-hook-form'

import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { FieldComponentProps } from './types'
import { ScrollArea } from '@/components/ui/scroll-area'

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
  onOpenChange,
  autoFocus,
  disabled = false,
  className = ''
}: ComboboxFieldProps<T>) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (autoFocus && !disabled) {
      setOpen(true)
      onOpenChange?.(true)
    }
  }, [autoFocus, disabled, onOpenChange])

  if (!selectOptions) return null

  const renderCombobox = (selectedValue: string | undefined, setSelectedValue: (nextValue: string) => void) => (
    <Popover
      open={open}
      onOpenChange={nextOpen => {
        setOpen(nextOpen)
        onOpenChange?.(nextOpen)
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          onClick={e => e.stopPropagation()}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`w-full justify-between ${selectedValue ? 'text-[#f4f4f5]' : 'text-[#a7a7ae]!'} ${className}`}
        >
          <span className='overflow-hidden'>
            {selectedValue ? selectOptions.find(o => o.value === selectedValue)?.label : placeholder}
          </span>
          <ChevronsUpDown className='ml-2 size-3.5 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        onWheel={e => e.stopPropagation()}
        align='start'
        className='w-[var(--radix-popover-trigger-width)] bg-[#09090B] p-0'
      >
        <Command className='bg-transparent'>
          <CommandInput placeholder='Search...' className='py-1' />
          <CommandEmpty>No results found.</CommandEmpty>

          <ScrollArea className='max-h-[calc(var(--radix-popover-content-available-height)-42px)]'>
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
                  className='text-sm py-1 hover:bg-[#1F1F1F] data-[selected=true]:bg-[#1F1F1F]'
                >
                  <Check className={`mr-2 size-4 ${selectedValue === opt.value ? 'opacity-100' : 'opacity-0'}`} />
                  {opt.labelPrefix && <span className='mr-2'>{opt.labelPrefix}</span>}
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </ScrollArea>
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
