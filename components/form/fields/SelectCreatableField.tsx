import React, { useEffect, useMemo, useState } from 'react'
import { Controller, FieldValues, Path } from 'react-hook-form'

import { Check, ChevronsUpDown, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

import { FieldComponentProps } from './types'
import { cn } from '@/lib/utils'

export type SelectCreatableFieldProps<T extends FieldValues> = Omit<FieldComponentProps<T>, 'register'>

const SelectCreatableField = <T extends FieldValues>({
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
  className
}: SelectCreatableFieldProps<T>) => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (autoFocus && !disabled) {
      setOpen(true)
      onOpenChange?.(true)
    }
  }, [autoFocus, disabled, onOpenChange])

  const normalizedOptions = useMemo(() => {
    return (selectOptions ?? []).map(option => ({
      value: option.value,
      label: option.label,
      labelPrefix: option.labelPrefix,
      disabled: option.disabled,
      key: `${option.value}::${option.label}`
    }))
  }, [selectOptions])

  const lookupLabel = (optionValue: string) => {
    const normalized = optionValue.trim().toLowerCase()

    const match = normalizedOptions.find(option => option.value.toLowerCase() === normalized)

    return match?.label ?? optionValue
  }

  const isExistingOption = (candidate: string) => {
    const normalized = candidate.trim().toLowerCase()

    if (!normalized) return false

    return normalizedOptions.some(option => option.value.toLowerCase() === normalized)
  }

  const renderSelect = (selectedValue: string | undefined, setSelectedValue: (nextValue: string) => void) => {
    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue)
      onBlur?.(optionValue)
      setOpen(false)
      setInputValue('')
    }

    const handleCreate = () => {
      const nextValue = inputValue.trim()

      if (!nextValue || isExistingOption(nextValue)) {
        return
      }

      handleSelect(nextValue)
    }

    const showCreate = inputValue.trim().length > 0 && !isExistingOption(inputValue)

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && showCreate) {
        e.preventDefault()
        handleCreate()
      }
    }

    return (
      <Popover
        open={open}
        onOpenChange={nextOpen => {
          setOpen(nextOpen)
          onOpenChange?.(nextOpen)

          if (!nextOpen) {
            setInputValue('')
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            disabled={disabled}
            autoFocus={autoFocus}
            className={cn(
              'w-full pe-1.5! justify-between',
              selectedValue ? 'text-[#f4f4f5]' : 'text-[#a7a7ae]!',
              className,
              'h-auto! min-h-7!'
            )}
          >
            <span className='overflow-hidden text-left flex-1'>
              {selectedValue ? lookupLabel(selectedValue) : placeholder}
            </span>
            <ChevronsUpDown className='ml-2 size-3.5 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align='start'
          onWheel={e => e.stopPropagation()}
          className='w-[var(--radix-popover-trigger-width)] p-0'
        >
          <Command className='bg-transparent'>
            <CommandInput
              placeholder='Search or create...'
              className='py-1'
              value={inputValue}
              onValueChange={setInputValue}
              autoFocus={autoFocus}
              onKeyDown={handleKeyDown}
            />
            <CommandEmpty>No results found.</CommandEmpty>

            <ScrollArea className='max-h-[calc(var(--radix-popover-content-available-height)-42px)]'>
              <CommandGroup>
                {showCreate && (
                  <CommandItem value={inputValue} onSelect={handleCreate} className='flex items-center gap-2'>
                    <Plus className='size-4' />
                    Create "{inputValue.trim()}"
                  </CommandItem>
                )}
                {normalizedOptions.map(option => {
                  const isSelected = selectedValue === option.value

                  return (
                    <CommandItem
                      key={option.key}
                      value={option.label}
                      disabled={!!option.disabled}
                      onSelect={() => handleSelect(option.value)}
                      className='flex items-center gap-2'
                    >
                      <Check className={cn('mr-2 size-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                      {option.labelPrefix && <span className='mr-2'>{option.labelPrefix}</span>}
                      {option.label}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  if (!control || !name) {
    return renderSelect(String(value ?? '') || undefined, nextValue => {
      onChange?.(nextValue)
    })
  }

  return (
    <Controller
      name={name as Path<T>}
      control={control}
      rules={rules}
      render={({ field }) => {
        return renderSelect(String(field.value ?? value ?? '') || undefined, nextValue => {
          field.onChange(nextValue)
          onChange?.(nextValue)
        })
      }}
    />
  )
}

export default SelectCreatableField
