import { useState } from 'react'
import { Button } from '@/components/ui/button'
import CustomFormField from '@/components/form/CustomFormField'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { X, Check } from 'lucide-react'

interface StylePopoverProps {
  value?: string
  onSave: (value: string) => void
  disabled?: boolean
  trigger?: React.ReactNode
}

interface ColorPopoverProps {
  value?: string
  onSave: (value: string) => void
  disabled?: boolean
  trigger?: React.ReactNode
}

export const StylePopover = ({ value = '', onSave, disabled = false, trigger }: StylePopoverProps) => {
  const [open, setOpen] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const handleSave = () => {
    onSave(editValue)
    setOpen(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {trigger || (
          <button className='text-left text-blue-400 hover:text-blue-500 cursor-pointer underline'>
            {value || 'N/A'}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className='w-64 p-3' side='right'>
        <div className='space-y-3'>
          <div className='space-y-1'>
            <label className='text-xs font-medium text-zinc-300'>Style</label>
            <CustomFormField
              type='text'
              placeholder='Enter style'
              value={editValue}
              onChange={(val: any) => setEditValue(val)}
              className='h-8'
            />
          </div>
          <div className='flex gap-2 justify-end'>
            <Button size='sm' variant='outline' onClick={handleCancel} className='h-7 px-2'>
              <X className='h-3 w-3' />
            </Button>
            <Button size='sm' onClick={handleSave} className='h-7 px-2'>
              <Check className='h-3 w-3' />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const ColorPopover = ({ value = '', onSave, disabled = false, trigger }: ColorPopoverProps) => {
  const [open, setOpen] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const handleSave = () => {
    onSave(editValue)
    setOpen(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {trigger || (
          <button className='text-left text-blue-400 hover:text-blue-500 cursor-pointer underline'>
            {value || 'N/A'}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className='w-64 p-3' side='right'>
        <div className='space-y-3'>
          <div className='space-y-1'>
            <label className='text-xs font-medium text-zinc-300'>Color</label>
            <CustomFormField
              type='text'
              placeholder='Enter color'
              value={editValue}
              onChange={(val: any) => setEditValue(val)}
              className='h-8'
            />
          </div>
          <div className='flex gap-2 justify-end'>
            <Button size='sm' variant='outline' onClick={handleCancel} className='h-7 px-2'>
              <X className='h-3 w-3' />
            </Button>
            <Button size='sm' onClick={handleSave} className='h-7 px-2'>
              <Check className='h-3 w-3' />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
