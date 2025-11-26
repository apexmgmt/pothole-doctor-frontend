'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDownIcon, ChevronUpIcon, Check, X, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot='select' {...props} />
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot='select-group' {...props} />
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot='select-value' {...props} />
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default'
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot='select-trigger'
      data-size={size}
      className={cn(
        "border-border cursor-pointer data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className='size-4 opacity-50' />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = 'popper',
  align = 'center',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot='select-content'
        className={cn(
          'bg-border text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md  shadow-md',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot='select-label'
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      {...props}
    />
  )
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot='select-item'
      className={cn(
        "focus:bg-bg/60 focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:bg-bg/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot='select-separator'
      className={cn('bg-bg rounded-xl pointer-events-none -mx-1 my-1 h-px', className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot='select-scroll-up-button'
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronUpIcon className='size-4' />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot='select-scroll-down-button'
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronDownIcon className='size-4' />
    </SelectPrimitive.ScrollDownButton>
  )
}

// New MultiSelect Component
interface MultiSelectProps {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  className,
  disabled
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]
    onChange(newSelected)
  }

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter(item => item !== value))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('w-full justify-between h-auto min-h-9 border-border bg-muted', className)}
          disabled={disabled}
        >
          <div className='flex flex-wrap gap-1'>
            {selected.length > 0 ? (
              selected.map(value => {
                const option = options.find(opt => opt.value === value)
                return (
                  <Badge key={value} variant='default' className='mr-1'>
                    {option?.label}
                    <span
                      className='ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer inline-flex'
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleRemove(value, e as any)
                        }
                      }}
                      onMouseDown={e => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={e => handleRemove(value, e)}
                      role='button'
                      tabIndex={0}
                    >
                      <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
                    </span>
                  </Badge>
                )
              })
            ) : (
              <span className='text-muted-foreground'>{placeholder}</span>
            )}
          </div>
          <ChevronDownIcon className='h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0' align='start'>
        <Command>
          <CommandInput placeholder='Search...' />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map(option => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className={cn('cursor-pointer', isSelected && 'bg-accent/80')}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-border',
                        isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className='h-4 w-4' />
                    </div>
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Add this new component before the exports
interface CreatableMultiSelectProps {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

function CreatableMultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select or type to add...',
  className,
  disabled
}: CreatableMultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]
    onChange(newSelected)
  }

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter(item => item !== value))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      e.preventDefault()
      const trimmedValue = searchValue.trim()

      // Check if it already exists in selected
      if (!selected.includes(trimmedValue)) {
        onChange([...selected, trimmedValue])
      }
      setSearchValue('')
    }
  }

  const filteredOptions = options.filter(option => option.label.toLowerCase().includes(searchValue.toLowerCase()))

  const showCreateOption =
    searchValue.trim() &&
    !filteredOptions.some(opt => opt.label.toLowerCase() === searchValue.toLowerCase()) &&
    !selected.includes(searchValue.trim())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('w-full border-border bg-muted justify-between h-auto min-h-9', className)}
          disabled={disabled}
        >
          <div className='flex flex-wrap gap-1'>
            {selected.length > 0 ? (
              selected.map(value => {
                const option = options.find(opt => opt.value === value)
                const label = option?.label || value
                return (
                  <Badge key={value} variant='default' className='mr-1'>
                    {label}
                    <span
                      className='ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer inline-flex'
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleRemove(value, e as any)
                        }
                      }}
                      onMouseDown={e => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={e => handleRemove(value, e)}
                      role='button'
                      tabIndex={0}
                    >
                      <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
                    </span>
                  </Badge>
                )
              })
            ) : (
              <span className='text-muted-foreground'>{placeholder}</span>
            )}
          </div>
          <ChevronDownIcon className='h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Search or type to add...'
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            {filteredOptions.length === 0 && !showCreateOption && <CommandEmpty>No results found.</CommandEmpty>}
            <CommandGroup>
              {filteredOptions.map(option => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className={cn('cursor-pointer', isSelected && 'bg-accent/80')}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className='h-4 w-4' />
                    </div>
                    {option.label}
                  </CommandItem>
                )
              })}
              {showCreateOption && (
                <CommandItem
                  onSelect={() => {
                    handleSelect(searchValue.trim())
                    setSearchValue('')
                  }}
                  className='cursor-pointer'
                >
                  <div className='mr-2 flex h-4 w-4 items-center justify-center'>
                    <Plus className='h-4 w-4' />
                  </div>
                  Create &quot;{searchValue}&quot;
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface CreatableSelectProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

function CreatableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select or type to add...',
  className,
  disabled
}: CreatableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  const filteredOptions = options.filter(option => option.label.toLowerCase().includes(searchValue.toLowerCase()))

  const showCreateOption =
    searchValue.trim() &&
    !filteredOptions.some(opt => opt.label.toLowerCase() === searchValue.toLowerCase()) &&
    value !== searchValue.trim()

  const selectedOption = options.find(opt => opt.value === value)
  const displayLabel = selectedOption?.label || value

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false)
    setSearchValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && showCreateOption) {
      e.preventDefault()
      handleSelect(searchValue.trim())
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('w-full border-border bg-muted justify-between h-auto min-h-9', className)}
          disabled={disabled}
        >
          <span>{value ? displayLabel : <span className='text-muted-foreground'>{placeholder}</span>}</span>
          <ChevronDownIcon className='h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Search or type to add...'
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            {filteredOptions.length === 0 && !showCreateOption && <CommandEmpty>No results found.</CommandEmpty>}
            <CommandGroup>
              {filteredOptions.map(option => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className={cn('cursor-pointer', value === option.value && 'bg-accent/80')}
                >
                  {/* <div
                    className={cn(
                      'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                      value === option.value ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
                    )}
                  >
                    <Check className='h-4 w-4' />
                  </div> */}
                  {option.label}
                </CommandItem>
              ))}
              {showCreateOption && (
                <CommandItem onSelect={() => handleSelect(searchValue.trim())} className='cursor-pointer'>
                  <div className='mr-2 flex h-4 w-4 items-center justify-center'>
                    <Plus className='h-4 w-4' />
                  </div>
                  Create &quot;{searchValue}&quot;
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  MultiSelect,
  CreatableMultiSelect,
  CreatableSelect
}
