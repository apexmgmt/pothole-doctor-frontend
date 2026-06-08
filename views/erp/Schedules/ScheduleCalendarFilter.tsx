'use client'

import React, { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Client, Partner, ServiceType, WorkOrder } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import CustomFormField from '@/components/form/CustomFormField'

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

  return (
    <ScrollArea className='xl:h-[835px] w-full xl:w-72 shrink-0 rounded-lg border border-border bg-card'>
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
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 '>
          <CustomFormField
            type='select'
            name='client_id'
            label='Customer'
            
            placeholder='Select Customer'
            value={filterOptions.client_id ?? 'all'}
            onChange={(value) => handleChange('client_id', value as string)}
            selectOptions={[
              { label: 'All Customers', value: 'all' },
              ...clients.map(client => ({
                label: client.company?.name || `${client.first_name} ${client.last_name}`.trim(),
                value: client.id,
              }))
            ]}
          />

          {/* Work Order */}
          <CustomFormField
            type='select'
            name='work_order_id'
            label='Work Order'
            
            placeholder='Select Work Order'
            value={filterOptions.work_order_id ?? 'all'}
            onChange={(value) => handleChange('work_order_id', value as string)}
            selectOptions={[
              { label: 'All Work Orders', value: 'all' },
              ...workOrders.map(wo => ({
                label: `#${wo.invoice_number_prefix ? `${wo.invoice_number_prefix}-` : ''}${wo.invoice_number?.toString() || '—'} - ${wo.title}`,
                value: wo.id,
              }))
            ]}
          />

          {/* Job Type / Service Type */}
          <CustomFormField
            type='select'
            name='service_type_id'
            label='Job Type'
            placeholder='Select Job Type'
            value={filterOptions.service_type_id ?? 'all'}
            onChange={(value) => handleChange('service_type_id', value as string)}
            selectOptions={[
              { label: 'All Job Types', value: 'all' },
              ...(filterOptions.work_order_id ? woServiceTypes : serviceTypes).map(st => ({
                label: st.name,
                value: st.id,
              }))
            ]}
          />

          {/* Contractor */}
          <CustomFormField
            type='combobox'
            name='contractor_id'
            label='Contractor'
            
            placeholder='Select Contractor'
            value={filterOptions.contractor_id ?? 'all'}
            onChange={(value) => handleChange('contractor_id', value as string)}
            selectOptions={[
              { label: 'All Contractors', value: 'all' },
              ...partners.map(partner => ({
                label: `${partner.first_name} ${partner.last_name}`.trim() || 'N/A',
                value: partner.id,
                labelPrefix: isAllContractorsSelected ? (
                  <span
                    className='inline-block h-2.5 w-2.5 rounded-full border border-white/30'
                    style={{ backgroundColor: partner?.userable?.schedule_color }}
                  />
                ) : undefined
              }))
            ]}
          />
        </div>

        {isAllContractorsSelected && partners.length > 0 && (
          <div className='flex flex-col gap-2 border border-border rounded-md p-3 bg-accent'>
            <p className='text-xs font-medium text-background'>Contractor Colors</p>
            <div className='flex flex-col gap-1.5 pr-1'>
              {partners.map(partner => (
                <div key={partner.id} className='flex items-center gap-2 text-xs'>
                  <span
                    className='inline-block h-2.5 w-2.5 rounded-full border border-white/30 shrink-0'
                    style={{ backgroundColor: partner?.userable?.schedule_color }}
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
