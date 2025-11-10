'use client'

import React, { useState, useEffect } from 'react'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/datePicker'
import { Input } from '@/components/ui/Input'

type Option = {
  value: string
  label: string
}

type Field = {
  key: string
  label: string
  type: string
  placeholder?: string
  defaultValue?: any
  options?: Option[]
  gridCols?: number
  fields?: Field[]
}

type DrawerButton = {
  label: string
  action: string
  variant: string
}

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters?: (filters: Record<string, any>) => void
  title?: string
  fields?: Field[]
  buttons?: DrawerButton[]
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  title = 'Filter',
  fields = [],
  buttons = [
    { label: 'Clear', action: 'clear', variant: 'outline' },
    { label: 'Apply Filters', action: 'apply', variant: 'primary' }
  ]
}) => {
  // Initialize filters based on provided fields
  const initialFilters = fields.reduce<Record<string, any>>((acc, field) => {
    acc[field.key] = field.defaultValue || ''
    return acc
  }, {})

  const [filters, setFilters] = useState<Record<string, any>>(initialFilters)

  // Reset filters when fields change
  useEffect(() => {
    const newInitialFilters = fields.reduce<Record<string, any>>((acc, field) => {
      acc[field.key] = field.defaultValue || ''
      return acc
    }, {})
    setFilters(newInitialFilters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields])

  const handleInputChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleButtonClick = (action: string) => {
    if (action === 'create' || action === 'apply') {
      onApplyFilters?.(filters)
      onClose()
    } else if (action === 'cancel') {
      onClose()
    } else if (action === 'clear') {
      setFilters(initialFilters)
    }
  }

  const renderField = (field: Field) => {
    const commonInputProps = {
      id: field.key,
      placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`,
      value: filters[field.key] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(field.key, e.target.value),
      className: 'bg-[#2a2a2a] border-[#404040] text-white placeholder:text-gray-400 focus:border-white'
    }

    const commonSelectProps = {
      value: filters[field.key] || '',
      onValueChange: (value: string) => handleInputChange(field.key, value)
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return <Input {...commonInputProps} type={field.type} />

      case 'date':
        return (
          <DatePicker
            value={filters[field.key] || null}
            onChange={(date: any) => handleInputChange(field.key, date)}
            placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
          />
        )

      case 'select':
        return (
          <Select {...commonSelectProps}>
            <SelectTrigger className='bg-[#2a2a2a] border-[#404040] text-white focus:border-white'>
              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className='bg-[#2a2a2a] border-[#404040]'>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value} className='text-white hover:bg-[#404040]'>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      default:
        return <Input {...commonInputProps} />
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side='right' className='w-[400px] bg-[#1a1a1a] border-border flex flex-col p-0 gap-0'>
        <SheetHeader className='p-6'>
          <div className='flex items-center justify-between'>
            <SheetTitle className='text-white text-lg font-medium'>{title}</SheetTitle>
            <button onClick={onClose} className='text-gray-400 hover:text-white transition-colors'>
              <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M12 4L4 12M4 4L12 12'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
          </div>
        </SheetHeader>

        <div className='space-y-6 px-6 pb-6 flex-1 overflow-y-auto'>
          {fields.map(field => (
            <div key={field.key} className={field.gridCols ? `grid grid-cols-${field.gridCols} gap-4` : 'space-y-2'}>
              {field.gridCols ? (
                // Handle grid layout for fields like date range
                field.fields?.map(subField => (
                  <div key={subField.key} className='space-y-2'>
                    <Label htmlFor={subField.key} className='text-white text-sm font-medium'>
                      {subField.label}
                    </Label>
                    {renderField(subField)}
                  </div>
                ))
              ) : (
                // Single field
                <>
                  <Label htmlFor={field.key} className='text-white text-sm font-medium'>
                    {field.label}
                  </Label>
                  {renderField(field)}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3 p-6 border-t border-[#404040]'>
          {buttons.map((button, index) => (
            <Button
              key={index}
              onClick={() => handleButtonClick(button.action)}
              variant={button.variant as any}
              className={`flex-1 font-medium ${
                button.variant === 'primary'
                  ? 'bg-white text-[#1a1a1a] hover:bg-gray-100'
                  : 'bg-[#2a2a2a] border-[#404040] text-white hover:bg-[#404040]'
              }`}
            >
              {button.label}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default FilterDrawer
