import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { ServiceType } from '@/types'
import { SettingsIcon } from 'lucide-react'

const AddServiceButton = ({
  serviceTypes,
  open,
  onOpenChange,
  onSelect
}: {
  serviceTypes: ServiceType[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (serviceTypeId: string) => void
}) => {
  return (
    <div className='relative'>
      <Button variant='outline' type='button' onClick={() => onOpenChange(true)} id='add-service-btn'>
        <span>
          <SettingsIcon className='h-4 w-4 inline-block mr-2' />
        </span>
        Add Service
      </Button>
      <Select
        open={open}
        value=''
        onOpenChange={onOpenChange}
        onValueChange={value => {
          onSelect(value)
        }}
      >
        {/*
          The SelectTrigger is visually hidden but present for popper positioning.
          It is absolutely positioned over the button.
        */}
        <SelectTrigger
          className='absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none'
          aria-label='Add Service'
          tabIndex={-1}
        />
        <SelectContent position='popper' align='end'>
          {serviceTypes.map(st => (
            <SelectItem key={st.id} value={st.id}>
              {st.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default AddServiceButton
