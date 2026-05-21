import { useMemo, useState } from 'react'
import { Controller, FieldValues, Path } from 'react-hook-form'

import { ChevronsUpDown, Plus, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

import { FieldComponentProps } from './types'
import { cn } from '@/lib/utils'

type MultiSelectCreatableFieldProps<T extends FieldValues> = Omit<FieldComponentProps<T>, 'register'>

const MultiSelectCreatableField = <T extends FieldValues>({
  name,
  placeholder,
  control,
  rules,
  selectOptions,
  value,
  onChange,
  onBlur,
  className
}: MultiSelectCreatableFieldProps<T>) => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const normalizedOptions = useMemo(() => {
    return (selectOptions ?? []).map(option => ({
      value: option.value,
      label: option.label,
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

    const handleCreate = () => {
      const nextValue = inputValue.trim()

      if (!nextValue || isExistingOption(nextValue)) {
        return
      }

      handleToggle(nextValue)
      setInputValue('')
    }

    const showCreate = inputValue.trim().length > 0 && !isExistingOption(inputValue)

    return (
      <Popover
        open={open}
        onOpenChange={nextOpen => {
          setOpen(nextOpen)

          if (!nextOpen) {
            setInputValue('')
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button variant='outline' className={cn('w-full justify-between', className, 'h-auto! min-h-7!')}>
            <div className='flex flex-1 flex-wrap items-center gap-1 text-left'>
              {!(selectedValues.length > 0) ? (
                <span className='text-[#a7a7ae]'>{placeholder}</span>
              ) : (
                selectedValues.map((valueItem, i) => (
                  <span
                    key={`${valueItem}-${i}`}
                    className='flex items-center gap-1.5 pl-2 pr-1 py-px rounded-sm text-xs leading-none text-[#f4f4f5] bg-white/10'
                  >
                    {lookupLabel(valueItem)}
                    <span
                      onClick={event => {
                        event.stopPropagation()
                        handleToggle(valueItem)
                      }}
                      className='p-1 hover:text-red-500 hover:bg-red-500/15 rounded-sm cursor-pointer'
                    >
                      <XIcon className='size-3' />
                    </span>
                  </span>
                ))
              )}
            </div>
            <ChevronsUpDown className='ml-2 size-3.5 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align='start'
          onWheel={e => e.stopPropagation()}
          className='w-[var(--radix-popover-trigger-width)] bg-[#09090B] p-0'
        >
          <Command className='bg-transparent'>
            <CommandInput
              placeholder='Search or create...'
              className='py-1'
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandEmpty>No results found.</CommandEmpty>

            <ScrollArea className='max-h-[calc(var(--radix-popover-content-available-height)-42px)]'>
              <CommandGroup>
                {showCreate && (
                  <CommandItem
                    value={inputValue}
                    onSelect={handleCreate}
                    className='flex items-center gap-2 py-1 hover:bg-[#1F1F1F] data-[selected=true]:bg-[#1F1F1F]'
                  >
                    <Plus className='size-4' />
                    Create "{inputValue.trim()}"
                  </CommandItem>
                )}
                {normalizedOptions.map(option => {
                  const isSelected = selectedValues.includes(option.value)

                  return (
                    <CommandItem
                      key={option.key}
                      value={option.label}
                      disabled={!!option.disabled}
                      onSelect={() => handleToggle(option.value)}
                      className='flex items-center gap-2 py-1 hover:bg-[#1F1F1F] data-[selected=true]:bg-[#1F1F1F]'
                    >
                      <Checkbox checked={isSelected} className='size-4 [&_span_svg]:size-3.25 pointer-events-none' />
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

export default MultiSelectCreatableField
