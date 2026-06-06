import { useEffect, useState } from 'react'
import { Controller, FieldValues, Path } from 'react-hook-form'

import { ChevronsUpDown, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { FieldComponentProps } from './types'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

export type MultiSelectFieldProps<T extends FieldValues> = Omit<FieldComponentProps<T>, 'register'>

const MultiSelectField = <T extends FieldValues>({
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
  className
}: MultiSelectFieldProps<T>) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (autoFocus && !disabled) {
      setOpen(true)
      onOpenChange?.(true)
    }
  }, [autoFocus, disabled, onOpenChange])

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
            disabled={disabled}
            autoFocus={autoFocus}
            className={cn('w-full pe-1.5! justify-between', className, 'h-auto! min-h-7!')}
          >
            <div
              className={`flex flex-1 flex-wrap items-center gap-1 text-left ${selectedValues.length === 0 ? 'text-[#a7a7ae] overflow-hidden' : 'text-[#f4f4f5]'}`}
            >
              {!(selectedValues.length > 0) ? (
                <span>{placeholder}</span>
              ) : (
                selectedValues.map((valueItem, i) => (
                  <span
                    key={`${valueItem}-${i}`}
                    className='flex items-center gap-1.5 pl-2 pr-1 py-px rounded-sm text-xs leading-none bg-white/10'
                  >
                    {selectOptions?.find(opt => opt.value === valueItem)?.label}
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
          className='w-[var(--radix-popover-trigger-width)] p-0'
        >
          <ScrollArea className='max-h-[var(--radix-popover-content-available-height)]'>
            <div className='flex flex-col gap-1 p-2'>
              {selectOptions.map(opt => (
                <label key={opt.value} className='flex items-center gap-2 px-2 py-1 hover:bg-[#1F1F1F] rounded-sm'>
                  <Checkbox
                    checked={selectedValues.includes(opt.value) ?? false}
                    onCheckedChange={() => handleToggle(opt.value)}
                  />
                  {opt.labelPrefix && <span className='mr-2'>{opt.labelPrefix}</span>}
                  {opt.label}
                </label>
              ))}
            </div>
          </ScrollArea>
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

export default MultiSelectField
