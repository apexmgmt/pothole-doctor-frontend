'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { BusinessLocation, MaterialJob, MaterialJobUpdatePayload, PaymentTerm, Warehouse } from '@/types'
import { VendorPickupAddress } from '@/types/vendors'
import { ClientAddress } from '@/types/clients/clients_addresses'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/datePicker'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import MaterialJobService from '@/services/api/products/material-jobs.service'
import VendorPickupAddressService from '@/services/api/vendors/vendor-pickup-addresses.service'
import ClientAddressService from '@/services/api/clients/client-addresses.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import WarehouseService from '@/services/api/warehouses.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'

interface UpdateMaterialJobModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  materialJob: MaterialJob | null
  onSuccess: () => void
}

interface FormValues {
  order_status: string
  estimated_received_date: Date | null
  shipped_date: Date | null
  po_create_date: Date | null
  order_number: string
  shipped_to: 'vendor_address' | 'location' | 'warehouse' | 'job_site' | ''
  shipped_to_location_id: string
  comments: string

  // Bill Information
  is_reconciled: boolean
  bill_date: Date | null
  payment_term_id: string
  due_date: Date | null
  freight_cost: string
  tax_amount: string
  discount_amount: string
  vendor_invoice_total: string
  adjustment_amount: string
}

const ORDER_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'ordered', label: 'Ordered' },
  { value: 'back_ordered', label: 'Back Ordered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'pending', label: 'Pending' }
]

const SHIP_TO_OPTIONS = [
  { value: 'vendor_address', label: 'Vendor Address' },
  { value: 'location', label: 'Location' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'job_site', label: 'Job Site' }
]

const UpdateMaterialJobModal = ({ open, onOpenChange, materialJob, onSuccess }: UpdateMaterialJobModalProps) => {
  const [vendorAddresses, setVendorAddresses] = useState<VendorPickupAddress[]>([])
  const [clientAddresses, setClientAddresses] = useState<ClientAddress[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>([])

  const form = useForm<FormValues>({
    defaultValues: {
      order_status: '',
      estimated_received_date: null,
      shipped_date: null,
      po_create_date: null,
      order_number: '',
      shipped_to: '',
      shipped_to_location_id: '',
      comments: '',
      is_reconciled: false,
      bill_date: null,
      payment_term_id: '',
      due_date: null,
      freight_cost: '',
      tax_amount: '',
      discount_amount: '',
      vendor_invoice_total: '',
      adjustment_amount: ''
    }
  })

  const shippedTo = form.watch('shipped_to')

  // Populate form when modal opens or job changes
  useEffect(() => {
    if (open && materialJob) {
      form.reset({
        order_status: materialJob.order_status || '',
        estimated_received_date: materialJob.estimate_received_date
          ? new Date(materialJob.estimate_received_date)
          : null,
        shipped_date: materialJob.shipped_date ? new Date(materialJob.shipped_date) : null,
        po_create_date: null,
        order_number: materialJob.order_number || '',
        shipped_to: '',
        shipped_to_location_id: '',
        comments: '',
        is_reconciled: false,
        bill_date: null,
        payment_term_id: '',
        due_date: null,
        freight_cost: '',
        tax_amount: '',
        discount_amount: '',
        vendor_invoice_total: '',
        adjustment_amount: ''
      })
      setVendorAddresses([])
      setClientAddresses([])
    }
  }, [open, materialJob])

  // Fetch payment terms, warehouses and business locations once on open
  useEffect(() => {
    if (!open) return

    PaymentTermsService.getAllPaymentTerms()
      .then(res => {
        const d = res.data

        setPaymentTerms(Array.isArray(d) ? d : (d?.data ?? []))
      })
      .catch(() => toast.error('Failed to load payment terms'))

    WarehouseService.getAll()
      .then(res => {
        const d = res.data

        setWarehouses(Array.isArray(d) ? d : (d?.data ?? []))
      })
      .catch(() => {})

    BusinessLocationService.getAll()
      .then(res => {
        const d = res.data

        setBusinessLocations(Array.isArray(d) ? d : (d?.data ?? []))
      })
      .catch(() => {})
  }, [open])

  // Fetch addresses when shipped_to changes
  useEffect(() => {
    form.setValue('shipped_to_location_id', '')

    if (!open || !materialJob) return

    if (shippedTo === 'vendor_address' && materialJob.vendor_id) {
      setIsLoadingAddresses(true)
      VendorPickupAddressService.index({ vendor_id: materialJob.vendor_id })
        .then(res => {
          const d = res.data

          setVendorAddresses(Array.isArray(d) ? d : (d?.data ?? []))
        })
        .catch(() => toast.error('Failed to load vendor addresses'))
        .finally(() => setIsLoadingAddresses(false))
    } else if (shippedTo === 'job_site' && materialJob.client_id) {
      setIsLoadingAddresses(true)
      ClientAddressService.index({ client_id: materialJob.client_id })
        .then(res => {
          const d = res.data

          setClientAddresses(Array.isArray(d) ? d : (d?.data ?? []))
        })
        .catch(() => toast.error('Failed to load customer addresses'))
        .finally(() => setIsLoadingAddresses(false))
    }
  }, [shippedTo, open, materialJob])

  const getShippedToLabel = () => {
    switch (shippedTo) {
      case 'warehouse':
        return 'Warehouse'
      case 'location':
        return 'Location'
      case 'vendor_address':
        return 'Vendor Address'
      case 'job_site':
        return 'Job Site Address'
      default:
        return 'Location'
    }
  }

  const getShippedToPlaceholder = () => {
    switch (shippedTo) {
      case 'warehouse':
        return 'Select warehouse'
      case 'location':
        return 'Select location'
      case 'vendor_address':
        return isLoadingAddresses ? 'Loading...' : 'Select vendor address'
      case 'job_site':
        return isLoadingAddresses ? 'Loading...' : 'Select job site address'
      default:
        return 'Select location'
    }
  }

  const renderShippedToOptions = () => {
    switch (shippedTo) {
      case 'warehouse':
        return warehouses.map(w => (
          <SelectItem key={w.id} value={w.id}>
            {w.title}
          </SelectItem>
        ))
      case 'location':
        return businessLocations.map(bl => (
          <SelectItem key={bl.id} value={bl.id}>
            {bl.name}
          </SelectItem>
        ))
      case 'vendor_address':
        return vendorAddresses.map(addr => (
          <SelectItem key={addr.id} value={addr.id}>
            {addr.title} {addr.street_address ? `— ${addr.street_address}` : ''}
          </SelectItem>
        ))
      case 'job_site':
        return clientAddresses.map(addr => (
          <SelectItem key={addr.id} value={addr.id}>
            {addr.title} {addr.street_address ? `— ${addr.street_address}` : ''}
          </SelectItem>
        ))
      default:
        return null
    }
  }

  const onSubmit = async (values: FormValues) => {
    if (!materialJob) return

    const payload: MaterialJobUpdatePayload = {
      order_status: values.order_status || undefined,
      order_number: values.order_number || undefined,
      estimated_received_date: values.estimated_received_date
        ? format(values.estimated_received_date, 'yyyy-MM-dd')
        : undefined,
      shipped_date: values.shipped_date ? format(values.shipped_date, 'yyyy-MM-dd') : undefined,
      po_create_date: values.po_create_date ? format(values.po_create_date, 'yyyy-MM-dd') : undefined,
      shipped_to: (values.shipped_to as MaterialJobUpdatePayload['shipped_to']) || undefined,
      shipped_to_location_id: values.shipped_to_location_id || undefined,
      comments: values.comments || undefined,
      is_reconciled: values.is_reconciled,
      bill_date: values.bill_date ? format(values.bill_date, 'yyyy-MM-dd') : undefined,
      payment_term_id: values.payment_term_id || undefined,
      due_date: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : undefined,
      freight_cost: values.freight_cost !== '' ? Number(values.freight_cost) : undefined,
      tax_amount: values.tax_amount !== '' ? Number(values.tax_amount) : undefined,
      discount_amount: values.discount_amount !== '' ? Number(values.discount_amount) : undefined,
      vendor_invoice_total: values.vendor_invoice_total !== '' ? Number(values.vendor_invoice_total) : undefined,
      adjustment_amount: values.adjustment_amount !== '' ? Number(values.adjustment_amount) : undefined
    }

    try {
      await MaterialJobService.update(materialJob.id, payload)
      toast.success('Material job updated successfully')
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      if (error?.errors && typeof error.errors === 'object') {
        Object.values(error.errors).forEach((errMsg: any) => {
          errMsg?.forEach((msg: string) => toast.error(msg))
        })
      } else {
        toast.error(error?.message || 'Something went wrong')
      }
    }
  }

  const onCancel = () => {
    onOpenChange(false)
    form.reset()
  }

  const displayField = (label: string, value: string | number | null | undefined) => (
    <div className='flex flex-col gap-1'>
      <span className='text-xs text-muted-foreground'>{label}</span>
      <span className='text-sm font-medium rounded-md px-3 py-2 bg-muted min-h-9'>{value ?? '—'}</span>
    </div>
  )

  const vendorName = materialJob?.vendor
    ? [materialJob.vendor.first_name, materialJob.vendor.last_name].filter(Boolean).join(' ')
    : '—'

  const vendorAddress = materialJob?.vendor?.userable?.street_address || '—'
  const vendorEmail = materialJob?.vendor?.email || '—'
  const vendorPhone = materialJob?.vendor?.userable?.phone || '—'

  const serviceItemName = materialJob?.service_item?.name || '—'
  const serviceItemDescription = materialJob?.service_item?.description || '—'
  const serviceTypeName = materialJob?.service_type?.name || '—'
  const productColor = (materialJob?.product as any)?.color?.name || '—'

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Update Material Job'
      description=''
      maxWidth='4xl'
      isLoading={form.formState.isSubmitting}
      loadingMessage='Saving...'
      disableClose={form.formState.isSubmitting}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={form.formState.isSubmitting}>
            Cancel
          </Button>
          <Button type='submit' form='update-material-job-form' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id='update-material-job-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* ── Section 1: Vendor Details ── */}
          <div>
            <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3'>Vendor Details</h3>
            <div className='grid grid-cols-2 gap-x-8 gap-y-3 p-4 rounded-lg border bg-muted/30'>
              {displayField('Vendor Name', vendorName)}
              {displayField('Email', vendorEmail)}
              {displayField('Phone', vendorPhone)}
              {displayField('Address', vendorAddress)}
            </div>
          </div>

          {/* ── Section 2: Product Details ── */}
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>Product Details</h3>
              <span className='text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary'>
                {serviceTypeName}
              </span>
            </div>
            <div className='p-4 rounded-lg border bg-muted/30 space-y-3'>
              <div className='grid grid-cols-2 gap-x-8 gap-y-3'>
                {displayField('Product Name', serviceItemName)}
                {displayField('Color', productColor)}
                {displayField('Description', serviceItemDescription)}
                {displayField('Quantity', materialJob?.quantity ?? '—')}
                {displayField(
                  'Total Material Cost',
                  materialJob?.total_material_cost != null
                    ? `$${Number(materialJob.total_material_cost).toFixed(2)}`
                    : '—'
                )}
              </div>

              <div className='grid grid-cols-3 gap-x-6 gap-y-4 pt-2'>
                {/* Order Status */}
                <FormField
                  control={form.control}
                  name='order_status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={form.formState.isSubmitting}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ORDER_STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Est. Received Date */}
                <FormField
                  control={form.control}
                  name='estimated_received_date'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Est. Received Date</FormLabel>
                      <FormControl>
                        <DatePicker value={field.value} onChange={field.onChange} placeholder='Select date' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Ship Date */}
                <FormField
                  control={form.control}
                  name='shipped_date'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ship Date</FormLabel>
                      <FormControl>
                        <DatePicker value={field.value} onChange={field.onChange} placeholder='Select date' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* ── Section 3: Order Information ── */}
          <div>
            <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
              Order Information
            </h3>
            <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
              {/* Order Number */}
              <FormField
                control={form.control}
                name='order_number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Number</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter order number' {...field} disabled={form.formState.isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PO Create Date */}
              <FormField
                control={form.control}
                name='po_create_date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Create Date</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} placeholder='Select date' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ship To */}
              <FormField
                control={form.control}
                name='shipped_to'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ship To</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={form.formState.isSubmitting}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select destination type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SHIP_TO_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dynamic Ship-To Location */}
              {shippedTo && (
                <FormField
                  control={form.control}
                  name='shipped_to_location_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getShippedToLabel()}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={form.formState.isSubmitting || isLoadingAddresses}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder={getShippedToPlaceholder()} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>{renderShippedToOptions()}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Comments — full width */}
              <div className='col-span-2'>
                <FormField
                  control={form.control}
                  name='comments'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Enter comments...'
                          className='resize-none min-h-20'
                          {...field}
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* ── Section 4: Bill Information ── */}
          <div>
            <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
              Bill Information
            </h3>
            <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
              {/* Reconciled Toggle */}
              <FormField
                control={form.control}
                name='is_reconciled'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center gap-3 space-y-0'>
                    <FormLabel className='min-w-fit'>Reconciled</FormLabel>
                    <FormControl>
                      <button
                        type='button'
                        role='switch'
                        aria-checked={field.value}
                        onClick={() => field.onChange(!field.value)}
                        disabled={form.formState.isSubmitting}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                          field.value ? 'bg-primary' : 'bg-input'
                        }`}
                      >
                        <span
                          className={`block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                            field.value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Term */}
              <FormField
                control={form.control}
                name='payment_term_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Term</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={form.formState.isSubmitting}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select payment term' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentTerms.map(term => (
                          <SelectItem key={term.id} value={term.id}>
                            {term.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bill Date */}
              <FormField
                control={form.control}
                name='bill_date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Date</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} placeholder='Select date' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
              <FormField
                control={form.control}
                name='due_date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} placeholder='Select date' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Freight */}
              <FormField
                control={form.control}
                name='freight_cost'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Freight</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        step='0.01'
                        placeholder='0.00'
                        {...field}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tax Total */}
              <FormField
                control={form.control}
                name='tax_amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Total</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        step='0.01'
                        placeholder='0.00'
                        {...field}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Discount */}
              <FormField
                control={form.control}
                name='discount_amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (-)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        step='0.01'
                        placeholder='0.00'
                        {...field}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vendor Invoice Total */}
              <FormField
                control={form.control}
                name='vendor_invoice_total'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Invoice Total</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        step='0.01'
                        placeholder='0.00'
                        {...field}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Adjustment Amount (+/-) */}
              <FormField
                control={form.control}
                name='adjustment_amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>+/-</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        {...field}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default UpdateMaterialJobModal
