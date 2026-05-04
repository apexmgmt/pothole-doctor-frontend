'use client'

import React, { useMemo, useState } from 'react'
import { Check, ChevronsUpDown, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Client, Partner, ServiceType, WorkOrder } from '@/types'
import { getPaletteColorByKey } from '@/constants/colors'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'

interface ScheduleCalendarFilterProps {
  clients: Client[]
  workOrders: WorkOrder[]
  serviceTypes: ServiceType[]
  partners: Partner[]
  filterOptions: any
  setFilterOptions: React.Dispatch<React.SetStateAction<any>>
}

/**
 * Sidebar filter panel for schedule calendar.
 * Supports customer/work-order/job-type/contractor filtering and contractor color legend.
 */
export default function ScheduleCalendarFilter({
  clients,
  workOrders,
  serviceTypes,
  partners,
  filterOptions,
  setFilterOptions
}: ScheduleCalendarFilterProps) {
  const [isContractorOpen, setIsContractorOpen] = useState(false)

  /**
   * Finds the currently selected work order from preloaded options.
   */
  const selectedWorkOrder = useMemo(() => {
    if (!filterOptions.work_order_id) {
      return null
    }

    return workOrders.find(wo => wo.id === filterOptions.work_order_id) || null
  }, [filterOptions.work_order_id, workOrders])

  /**
   * Derives unique service types from the selected work order services.
   */
  const woServiceTypes = useMemo<ServiceType[]>(() => {
    const services = selectedWorkOrder?.services || []

    if (!services.length) {
      return []
    }

    const seen = new Set<string>()

    return services.reduce<ServiceType[]>((acc, service) => {
      const serviceType = service.service_type

      if (serviceType?.id && !seen.has(serviceType.id)) {
        seen.add(serviceType.id)
        acc.push(serviceType)
      }

      return acc
    }, [])
  }, [selectedWorkOrder])

  /**
   * Applies a single filter value.
   * Passing `all` clears the filter key from state.
   */
  const handleChange = (key: string, value: string) => {
    setFilterOptions((prev: any) => {
      const next = { ...prev }

      if (value && value !== 'all') {
        next[key] = value
      } else {
        delete next[key]
      }

      // Clear service type when work order changes
      if (key === 'work_order_id') {
        delete next.service_type_id
      }

      return next
    })
  }

  /**
   * Clears all user-controlled filter fields while preserving date range and other params.
   */
  const handleReset = () => {
    setFilterOptions((prev: any) => {
      const { client_id, work_order_id, service_type_id, contractor_id, ...rest } = prev

      return rest
    })
  }

  const hasActiveFilters =
    filterOptions.client_id ||
    filterOptions.work_order_id ||
    filterOptions.service_type_id ||
    filterOptions.contractor_id

  const isAllContractorsSelected = !filterOptions.contractor_id || filterOptions.contractor_id === 'all'

  /**
   * Used to show selected contractor label in the searchable combobox trigger.
   */
  const selectedContractor = useMemo(() => {
    if (!filterOptions.contractor_id || filterOptions.contractor_id === 'all') {
      return null
    }

    return partners.find(partner => partner.id === filterOptions.contractor_id) || null
  }, [filterOptions.contractor_id, partners])

  return (
    <ScrollArea className='h-[835px] w-72 shrink-0 rounded-lg border border-border bg-card'>
      <div className='flex flex-col gap-4 p-4'>
        <div className='flex items-center justify-between'>
          <span className='font-semibold text-sm'>Filters</span>
          {hasActiveFilters && (
            <Button variant='ghost' size='sm' onClick={handleReset} className='h-7 px-2 text-xs gap-1'>
              <RotateCcw className='w-3 h-3' />
              Reset
            </Button>
          )}
        </div>

        {/* Customer */}
        <div className='flex flex-col gap-1.5'>
          <Label className='text-xs text-muted-foreground'>Customer</Label>
          <Select value={filterOptions.client_id ?? 'all'} onValueChange={value => handleChange('client_id', value)}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select Customer' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Customers</SelectItem>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.company?.name || `${client.first_name} ${client.last_name}`.trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Work Order */}
        <div className='flex flex-col gap-1.5'>
          <Label className='text-xs text-muted-foreground'>Work Order</Label>
          <Select
            value={filterOptions.work_order_id ?? 'all'}
            onValueChange={value => handleChange('work_order_id', value)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select Work Order' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Work Orders</SelectItem>
              {workOrders.map(wo => (
                <SelectItem key={wo.id} value={wo.id}>
                  #{wo.work_order_number} – {wo.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Job Type / Service Type */}
        <div className='flex flex-col gap-1.5'>
          <Label className='text-xs text-muted-foreground'>Job Type</Label>
          <Select
            value={filterOptions.service_type_id ?? 'all'}
            onValueChange={value => handleChange('service_type_id', value)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select Job Type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Job Types</SelectItem>
              {(filterOptions.work_order_id ? woServiceTypes : serviceTypes).map(st => (
                <SelectItem key={st.id} value={st.id}>
                  {st.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contractor */}
        <div className='flex flex-col gap-1.5'>
          <Label className='text-xs text-muted-foreground'>Contractor</Label>
          <Popover open={isContractorOpen} onOpenChange={setIsContractorOpen}>
            <PopoverTrigger asChild>
              <Button
                type='button'
                variant='outline'
                role='combobox'
                aria-expanded={isContractorOpen}
                className='w-full justify-between bg-transparent px-3 text-sm font-normal'
              >
                <span className='truncate text-left'>
                  {selectedContractor
                    ? `${selectedContractor.first_name} ${selectedContractor.last_name}`.trim()
                    : 'All Contractors'}
                </span>
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-(--radix-popover-trigger-width) p-0' align='start'>
              <Command>
                <CommandInput placeholder='Search contractor...' />
                <CommandList>
                  <CommandEmpty>No contractor found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value='all contractors'
                      onSelect={() => {
                        handleChange('contractor_id', 'all')
                        setIsContractorOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          (filterOptions.contractor_id ?? 'all') === 'all' ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span>All Contractors</span>
                    </CommandItem>

                    {partners.map(partner => {
                      const partnerName = `${partner.first_name} ${partner.last_name}`.trim()
                      const isSelected = filterOptions.contractor_id === partner.id

                      return (
                        <CommandItem
                          key={partner.id}
                          value={partnerName}
                          onSelect={() => {
                            handleChange('contractor_id', partner.id)
                            setIsContractorOpen(false)
                          }}
                        >
                          <Check className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                          {isAllContractorsSelected && (
                            <span
                              className='mr-2 inline-block h-2.5 w-2.5 rounded-full border border-white/30'
                              style={{ backgroundColor: getPaletteColorByKey(partner.id) }}
                            />
                          )}
                          <span>{partnerName || 'N/A'}</span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {isAllContractorsSelected && partners.length > 0 && (
          <div className='flex flex-col gap-2 border border-border rounded-md p-3 bg-accent'>
            <p className='text-xs font-medium text-background'>Contractor Colors</p>
            <div className='flex flex-col gap-1.5 pr-1'>
              {partners.map(partner => (
                <div key={partner.id} className='flex items-center gap-2 text-xs'>
                  <span
                    className='inline-block h-2.5 w-2.5 rounded-full border border-white/30 shrink-0'
                    style={{ backgroundColor: getPaletteColorByKey(partner.id) }}
                  />
                  <span className='truncate'>{`${partner.first_name} ${partner.last_name}`.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
