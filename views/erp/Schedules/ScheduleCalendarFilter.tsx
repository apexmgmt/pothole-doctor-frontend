'use client'

import React, { useMemo } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Client, Partner, ServiceType, WorkOrder } from '@/types'
import { getPaletteColorByKey } from '@/constants/colors'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ScheduleCalendarFilterProps {
  clients: Client[]
  workOrders: WorkOrder[]
  serviceTypes: ServiceType[]
  partners: Partner[]
  filterOptions: any
  setFilterOptions: React.Dispatch<React.SetStateAction<any>>
}

export default function ScheduleCalendarFilter({
  clients,
  workOrders,
  serviceTypes,
  partners,
  filterOptions,
  setFilterOptions
}: ScheduleCalendarFilterProps) {
  const selectedWorkOrder = useMemo(() => {
    if (!filterOptions.work_order_id) {
      return null
    }

    return workOrders.find(wo => wo.id === filterOptions.work_order_id) || null
  }, [filterOptions.work_order_id, workOrders])

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
          <Select
            value={filterOptions.contractor_id ?? 'all'}
            onValueChange={value => handleChange('contractor_id', value)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select Contractor' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Contractors</SelectItem>
              {partners.map(partner => (
                <SelectItem key={partner.id} value={partner.id}>
                  <div className='flex items-center gap-2'>
                    <span
                      className='inline-block h-2.5 w-2.5 rounded-full border border-white/30'
                      style={{ backgroundColor: getPaletteColorByKey(partner.id) }}
                    />
                    <span>{`${partner.first_name} ${partner.last_name}`.trim()}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
