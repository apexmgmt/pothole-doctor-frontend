'use client'

import { UseFormReturn } from 'react-hook-form'

import { DatePicker } from '@/components/ui/datePicker'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { BusinessLocation, Courier, Warehouse } from '@/types'
import type { FormValues } from './types'

interface OrderDetailsFormProps {
  form: UseFormReturn<FormValues>
  couriers: Courier[]
  warehouses: Warehouse[]
  businessLocations: BusinessLocation[]
  warehouseType: 'warehouse' | 'location'
}

const OrderDetailsForm = ({ form, couriers, warehouses, businessLocations, warehouseType }: OrderDetailsFormProps) => {
  return (
    <div className='border border-border rounded-lg p-4'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <FormField
          control={form.control}
          name='courier_id'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carrier</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select Carrier' />
                  </SelectTrigger>
                  <SelectContent>
                    {couriers.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='reference_number'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference Number</FormLabel>
              <FormControl>
                <Input placeholder='Reference Number' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='est_departure_date'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Est. Departure</FormLabel>
              <FormControl>
                <DatePicker value={field.value} onChange={field.onChange} placeholder='Est. Departure' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='est_arrival_date'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Est. Arrival</FormLabel>
              <FormControl>
                <DatePicker value={field.value} onChange={field.onChange} placeholder='Est. Arrival' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='est_shipping_cost'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Est. Shipping Cost</FormLabel>
              <FormControl>
                <Input type='number' step='any' min={0} placeholder='0.00' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='warehouse_type'
          rules={{ required: 'Warehouse type is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Warehouse Type <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={val => {
                    field.onChange(val)
                    form.setValue('warehouse_id', '')
                  }}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select Type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='warehouse'>Warehouse</SelectItem>
                    <SelectItem value='location'>Location</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          key={`warehouse_id-${warehouseType}`}
          control={form.control}
          name='warehouse_id'
          rules={{ required: 'Warehouse is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Warehouse <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder={warehouseType === 'warehouse' ? 'Select Warehouse' : 'Select Location'} />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouseType === 'warehouse'
                      ? warehouses.map(w => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.title}
                          </SelectItem>
                        ))
                      : businessLocations.map(l => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='payment_due'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Due</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select Payment Type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='on_arrival'>On Arrival</SelectItem>
                    <SelectItem value='paid'>Paid</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='comments'
          render={({ field }) => (
            <FormItem className='sm:col-span-2 lg:col-span-4'>
              <FormLabel>Comments</FormLabel>
              <FormControl>
                <Textarea placeholder='Comments...' rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

export default OrderDetailsForm
