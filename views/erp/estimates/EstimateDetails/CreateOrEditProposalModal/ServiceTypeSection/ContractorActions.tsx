import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Partner } from '@/types'
import { CheckIcon, ChevronDownIcon, UserIcon, Users, CalendarIcon } from 'lucide-react'
import { useState } from 'react'

const ContractorActions = ({
  contractors = [],
  contractorId = null,
  handleSelectContractor,
  onAddSchedule
}: {
  contractors: Partner[]
  contractorId?: string | null
  handleSelectContractor: (id: string) => void
  onAddSchedule?: () => void
}) => {
  const [open, setOpen] = useState(false)
  const [showContractorList, setShowContractorList] = useState(false)

  // Reset the view when the popover closes
  const onOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) setShowContractorList(false)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button type='button' variant='outline' size='sm' className='h-7 text-xs'>
          <UserIcon className='h-3 w-3 mr-1' />
          Contractor Actions
          <ChevronDownIcon className='h-3 w-3 ml-1' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-64 p-0' align='end'>
        <Command>
          {!showContractorList ? (
            <CommandList>
              <CommandGroup heading='Actions'>
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    onAddSchedule?.()
                  }}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  <span>Add / View Schedule</span>
                </CommandItem>
                <CommandItem onSelect={() => setShowContractorList(true)}>
                  <Users className='mr-2 h-4 w-4' />
                  <span>Select Contractor</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          ) : (
            <>
              <CommandInput placeholder='Search contractor...' />
              {/* Added max-h and overflow classes here */}
              <CommandList className='max-h-[250px] overflow-y-auto overflow-x-hidden'>
                <CommandEmpty>No contractor found.</CommandEmpty>
                <CommandSeparator />
                <CommandGroup>
                  {contractors?.map(contractor => {
                    const name = [contractor.first_name, contractor.last_name].filter(Boolean).join(' ') || 'Unnamed'

                    return (
                      <CommandItem
                        key={contractor.id}
                        value={name}
                        onSelect={() => {
                          handleSelectContractor(contractor.id)
                          setOpen(false)
                        }}
                      >
                        <CheckIcon
                          className={cn('mr-2 h-4 w-4', contractor.id === contractorId ? 'opacity-100' : 'opacity-0')}
                        />
                        {name}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default ContractorActions
