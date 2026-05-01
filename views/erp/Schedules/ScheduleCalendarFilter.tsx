'use client'

import React, { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Client, Partner, ServiceType, WorkOrder } from '@/types'
import WorkOrderService from '@/services/api/work-orders/work_orders.service'

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
  const [woServiceTypes, setWoServiceTypes] = useState<ServiceType[]>([])
  const [isFetchingWO, setIsFetchingWO] = useState(false)

  // When work_order_id changes, fetch that WO's services and derive service types
  useEffect(() => {
    if (!filterOptions.work_order_id) {
      setWoServiceTypes([])

      return
    }

    setIsFetchingWO(true)
    WorkOrderService.show(filterOptions.work_order_id)
      .then(resp => {
        const wo = resp?.data ?? resp
        const seen = new Set<string>()
        const types: ServiceType[] = []

        // eslint-disable-next-line no-extra-semi
        ;(wo.services || []).forEach((svc: any) => {
          if (svc.service_type && !seen.has(svc.service_type.id)) {
            seen.add(svc.service_type.id)
            types.push(svc.service_type)
          }
        })

        setWoServiceTypes(types)
      })
      .catch(() => setWoServiceTypes([]))
      .finally(() => setIsFetchingWO(false))
  }, [filterOptions.work_order_id])

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

  return (
    <div className='w-72 shrink-0 border border-border rounded-lg p-4 flex flex-col gap-4 bg-card h-fit'>
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
          disabled={isFetchingWO}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={isFetchingWO ? 'Loading...' : 'Select Job Type'} />
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
                {`${partner.first_name} ${partner.last_name}`.trim()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
