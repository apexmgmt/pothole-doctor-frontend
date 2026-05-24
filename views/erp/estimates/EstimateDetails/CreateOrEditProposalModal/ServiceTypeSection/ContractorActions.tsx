import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
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
  const [showContractorPopover, setShowContractorPopover] = useState(false)

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type='button' variant='outline' size='sm' className='h-7 text-xs'>
            <UserIcon className='h-3 w-3 mr-1' />
            Contractor Actions
            <ChevronDownIcon className='h-3 w-3 ml-1' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-64 p-0' align='end'>
          <Command>
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
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    setShowContractorPopover(true)
                  }}
                >
                  <Users className='mr-2 h-4 w-4' />
                  <span>Select Contractor</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Contractor Selection Popover - positioned to appear on left */}
      <div className='relative inline-block'>
        <Popover open={showContractorPopover} onOpenChange={setShowContractorPopover}>
          <PopoverTrigger asChild>
            <div className='absolute -left-112 w-0 h-0 pointer-events-none' />
          </PopoverTrigger>
          <PopoverContent className='w-64 p-0' side='right' align='start'>
            <Command>
              <CommandInput placeholder='Search contractor...' />
              <CommandList className='max-h-[300px] overflow-y-auto'>
                <CommandEmpty>No contractor found.</CommandEmpty>
                <CommandGroup>
                  {contractors?.map(contractor => {
                    const name =
                      [contractor.first_name, contractor.last_name].filter(Boolean).join(' ') ||
                      contractor?.userable?.company?.name ||
                      'Contractor'

                    return (
                      <CommandItem
                        key={contractor.id}
                        value={name}
                        onSelect={() => {
                          handleSelectContractor(contractor.id)
                          setShowContractorPopover(false)
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
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}

export default ContractorActions
