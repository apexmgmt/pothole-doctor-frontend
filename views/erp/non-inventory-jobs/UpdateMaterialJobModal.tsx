'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { BusinessLocation, MaterialJob, MaterialJobUpdatePayload, PaymentTerm, Warehouse } from '@/types'
import { VendorPickupAddress } from '@/types/vendors'
import { ClientAddress } from '@/types/clients/clients_addresses'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import MaterialJobService from '@/services/api/products/material-jobs.service'
import VendorPickupAddressService from '@/services/api/vendors/vendor-pickup-addresses.service'
import ClientAddressService from '@/services/api/clients/client-addresses.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import WarehouseService from '@/services/api/warehouses.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import { cn } from '@/lib/utils'
import CustomFormField from '@/components/form/CustomFormField'

interface UpdateMaterialJobModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  materialJob: MaterialJob | null
  onSuccess: (updatedData?: any) => void
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
  total_amount: string
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

/**
 * Calculates billing information based on service item data
 * Uses: unit_cost, qty, freight_charge, tax_amount, tax_type, discount, discount_type
 */
const calculateBillingInfo = (materialJob: MaterialJob | null) => {
  if (!materialJob?.service_item) {
    return {
      baseCost: 0,
      freightCost: 0,
      taxAmount: 0,
      discountAmount: 0,
      vendorInvoiceTotal: 0
    }
  }

  const { service_item, quantity } = materialJob

  // Ensure all values are numbers
  const unitCost = Number(service_item.unit_cost) || 0
  const qty = Number(quantity) || 1
  const freightCharge = Number(service_item.freight_charge) || 0

  // Base cost = unit_cost * quantity
  const baseCost = unitCost * qty

  // Freight cost
  const freightCost = freightCharge

  // Tax calculation
  let taxAmount = 0

  if (service_item.tax_type === 'percentage' && service_item.tax && service_item.is_sale) {
    const taxRate = Number(service_item.tax) || 0

    // Tax as percentage of (base cost + freight)
    taxAmount = (baseCost + freightCost) * (taxRate / 100)
  } else if (service_item.tax_type === 'fixed') {
    // Tax as fixed amount
    taxAmount = Number(service_item.tax_amount) || 0
  }

  // Discount calculation
  let discountAmount = 0

  if (service_item.discount_type === 'percentage' && service_item.discount) {
    const discountRate = Number(service_item.discount) || 0

    // Discount as percentage of base cost
    discountAmount = baseCost * (discountRate / 100)
  } else if (service_item.discount_type === 'fixed') {
    // Discount as fixed amount
    discountAmount = Number(service_item.discount) || 0
  }

  // Total = base cost + freight + tax - discount
  const vendorInvoiceTotal = baseCost + freightCost + taxAmount - discountAmount

  return {
    baseCost: Number(baseCost.toFixed(2)),
    freightCost: Number(freightCost.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    vendorInvoiceTotal: Number(vendorInvoiceTotal.toFixed(2))
  }
}

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
      total_amount: '',
      vendor_invoice_total: '',
      adjustment_amount: ''
    }
  })

  const {
    reset,
    watch,
    setValue,
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = form

  const shippedTo = watch('shipped_to')

  // Populate form when modal opens or job changes
  useEffect(() => {
    if (open && materialJob) {
      // Calculate billing information based on service item
      const billing = calculateBillingInfo(materialJob)

      reset({
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
        freight_cost: String(billing.freightCost),
        tax_amount: String(billing.taxAmount),
        discount_amount: String(billing.discountAmount),
        total_amount: String(billing.vendorInvoiceTotal),
        vendor_invoice_total: String(billing.vendorInvoiceTotal),
        adjustment_amount: ''
      })
      setVendorAddresses([])
      setClientAddresses([])
    }
  }, [open, materialJob, form])

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
    setValue('shipped_to_location_id', '')

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

  // Watch billing fields and recalculate vendor_invoice_total
  const freightCost = watch('freight_cost')
  const taxAmount = watch('tax_amount')
  const discountAmount = watch('discount_amount')

  useEffect(() => {
    if (!open || !materialJob?.service_item) return

    // Calculate base cost from service item
    const unitCost = Number(materialJob.service_item.unit_cost) || 0
    const qty = Number(materialJob.quantity) || 1
    const baseCost = unitCost * qty

    // Parse input values
    const freight = freightCost !== '' ? Number(freightCost) : 0
    const tax = taxAmount !== '' ? Number(taxAmount) : 0
    const discount = discountAmount !== '' ? Number(discountAmount) : 0

    // Calculate total = base cost + freight + tax - discount
    const total = baseCost + freight + tax - discount

    // Update total_amount (read-only display) as string
    setValue('total_amount', String(total.toFixed(2)))
  }, [freightCost, taxAmount, discountAmount, open, materialJob, form])

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
      const response = await MaterialJobService.update(materialJob.id, payload)
      const responseData = response?.data ?? response

      toast.success('Material job updated successfully')
      onOpenChange(false)
      onSuccess(responseData)
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
    reset()
  }

  const displayField = (label: string, value: string | number | null | undefined, index?: number) => {
    const isFirst2 = index !== undefined && index % 2 === 0
    const isFirst3 = index !== undefined && index % 3 === 0
    const isFirst4 = index !== undefined && index % 4 === 0

    const borderClass = cn(
      isFirst2 ? 'border-l-0 pl-0' : 'border-l border-border pl-3',
      isFirst3 ? 'md:border-l-0 md:pl-0' : 'md:border-l md:border-border md:pl-3',
      isFirst4 ? 'lg:border-l-0 lg:pl-0' : 'lg:border-l lg:border-border lg:pl-3'
    )

    return (
      <div key={`${label}-${index}`} className={cn('flex flex-col gap-1.25', borderClass)}>
        <span className='text-xs text-muted-foreground font-normal leading-none'>{label}</span>
        <span className='text-[13px] font-medium leading-tight'>{value ?? '—'}</span>
      </div>
    )
  }

  const fieldStyle = 'grid grid-cols-[124px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  const vendorName = materialJob?.vendor
    ? [materialJob.vendor.first_name, materialJob.vendor.last_name].filter(Boolean).join(' ')
    : '—'

  const vendorAddress = materialJob?.vendor?.userable?.street_address || '—'
  const vendorEmail = materialJob?.vendor?.email || '—'
  const vendorPhone = materialJob?.vendor?.userable?.phone || '—'

  const calculatedBilling = calculateBillingInfo(materialJob)

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
      isLoading={isSubmitting}
      loadingMessage='Saving...'
      disableClose={isSubmitting}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' size='sm' onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type='submit' size='sm' form='update-material-job-form' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id='update-material-job-form' onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* ── Section 1: Vendor Details ── */}
          <div>
            <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3'>Vendor Details</h3>
            <div className='p-2.5 bg-[#1F1F1F] rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-6'>
              {[
                { label: 'Vendor Name', value: vendorName },
                { label: 'Email', value: vendorEmail },
                { label: 'Phone', value: vendorPhone },
                { label: 'Address', value: vendorAddress }
              ].map((field, idx) => displayField(field.label, field.value, idx))}
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
            <div className='p-4 rounded-lg border border-border bg-[#1F1F1F]/30 space-y-3'>
              <div className='p-2.5 bg-[#1F1F1F] rounded-lg grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6'>
                {[
                  { label: 'Product Name', value: serviceItemName },
                  { label: 'Color', value: productColor },
                  { label: 'Description', value: serviceItemDescription },
                  {
                    label: 'Quantity',
                    value: `${materialJob?.quantity} ${materialJob?.selling_unit?.name || materialJob?.service_item?.unit?.name || 'Unit'}${materialJob?.quantity !== materialJob?.purchase_quantity ? ` (${materialJob?.purchase_quantity} ${materialJob?.purchase_unit?.name || 'Unit'})` : ''}`
                  },
                  {
                    label: 'Unit Cost',
                    value:
                      materialJob?.service_item?.unit_cost != null
                        ? `$${Number(materialJob.service_item?.unit_cost).toFixed(2)}`
                        : '—'
                  },
                  {
                    label: 'Total Tax Amount',
                    value: `$${calculatedBilling.taxAmount.toFixed(2)}${materialJob?.service_item?.tax_type === 'percentage' ? ` (${materialJob.service_item.tax}%)` : ''}`
                  },
                  {
                    label: 'Freight Charge',
                    value:
                      materialJob?.service_item?.freight_charge != null
                        ? `$${Number(materialJob.service_item?.freight_charge).toFixed(2)}`
                        : '—'
                  }
                ].map((field, idx) => displayField(field.label, field.value, idx))}
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-2 pt-2'>
                {/* Order Status */}
                <CustomFormField
                  name='order_status'
                  label='Order Status'
                  type='select'
                  placeholder='Select status'
                  selectOptions={ORDER_STATUS_OPTIONS}
                  control={control}
                  errors={errors}
                  fieldClassName={fieldStyle}
                  labelClassName={labelStyle}
                  disabled={isSubmitting}
                />

                {/* Est. Received Date */}
                <CustomFormField
                  name='estimated_received_date'
                  label='Est. Received Date'
                  type='datepicker'
                  placeholder='Select date'
                  control={control}
                  errors={errors}
                  fieldClassName={fieldStyle}
                  labelClassName={labelStyle}
                  disabled={isSubmitting}
                />

                {/* Ship Date */}
                <CustomFormField
                  name='shipped_date'
                  label='Ship Date'
                  type='datepicker'
                  placeholder='Select date'
                  control={control}
                  errors={errors}
                  fieldClassName={fieldStyle}
                  labelClassName={labelStyle}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* ── Section 3: Order Information ── */}
          <div>
            <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
              Order Information
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2'>
              {/* Order Number */}
              <CustomFormField
                name='order_number'
                label='Order Number'
                placeholder='Enter order number'
                rules={{ required: 'Order Number Is Required' }}
                register={register}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
                disabled={isSubmitting}
              />

              {/* PO Create Date */}
              <CustomFormField
                name='po_create_date'
                label='PO Create Date'
                type='datepicker'
                placeholder='Select date'
                control={control}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
                disabled={isSubmitting}
              />

              {/* Ship To */}
              <CustomFormField
                name='shipped_to'
                label='Ship To'
                type='select'
                placeholder='Select destination type'
                selectOptions={SHIP_TO_OPTIONS}
                control={control}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
                disabled={isSubmitting}
              />

              {/* Dynamic Ship-To Location */}
              {shippedTo && (
                <CustomFormField
                  name='shipped_to_location_id'
                  label={getShippedToLabel()}
                  type='select'
                  placeholder={getShippedToPlaceholder()}
                  selectOptions={
                    shippedTo === 'warehouse'
                      ? warehouses.map(w => ({ value: w.id, label: w.title }))
                      : shippedTo === 'location'
                        ? businessLocations.map(bl => ({ value: bl.id, label: bl.name }))
                        : shippedTo === 'vendor_address'
                          ? vendorAddresses.map(addr => ({
                              value: addr.id,
                              label: `${addr.title}${addr.street_address ? ` — ${addr.street_address}` : ''}`
                            }))
                          : shippedTo === 'job_site'
                            ? clientAddresses.map(addr => ({
                                value: addr.id,
                                label: `${addr.title}${addr.street_address ? ` — ${addr.street_address}` : ''}`
                              }))
                            : []
                  }
                  control={control}
                  errors={errors}
                  fieldClassName={fieldStyle}
                  labelClassName={labelStyle}
                  disabled={isSubmitting || isLoadingAddresses}
                />
              )}

              {/* Comments — full width */}
              <CustomFormField
                name='comments'
                label='Comments'
                type='textarea'
                placeholder='Enter comments...'
                register={register}
                errors={errors}
                fieldClassName={`sm:col-span-2 ${fieldStyle}`}
                labelClassName={labelStyle}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* ── Section 4: Bill Information ── */}
          <div>
            <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
              Bill Information
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2'>
              {/* Reconciled Toggle */}
              <CustomFormField
                name='is_reconciled'
                label='Reconciled'
                type='switch'
                control={control}
                errors={errors}
                fieldClassName='grid grid-cols-[152px_minmax(0,_1fr)] [&_button]:order-2 [&_label]:order-1'
                labelClassName={labelStyle}
                disabled={isSubmitting}
              />

              {/* Payment Term */}
              <CustomFormField
                name='payment_term_id'
                label='Payment Term'
                type='select'
                placeholder='Select payment term'
                selectOptions={paymentTerms.map(term => ({ value: term.id, label: term.name }))}
                control={control}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
                disabled={isSubmitting}
              />

              {/* Bill Date */}
              <CustomFormField
                name='bill_date'
                label='Bill Date'
                type='datepicker'
                placeholder='Select date'
                control={control}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
                disabled={isSubmitting}
              />

              {/* Due Date */}
              <CustomFormField
                name='due_date'
                label='Due Date'
                type='datepicker'
                placeholder='Select date'
                control={control}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
                disabled={isSubmitting}
              />

              {/* ── Financial Fields: inline label + input layout ── */}
              <div className='sm:col-span-2 border border-border rounded-lg p-4 space-y-2 bg-[#1F1F1F]/20'>
                {/* Freight */}
                <CustomFormField
                  name='freight_cost'
                  label='Freight'
                  type='number'
                  placeholder='0.00'
                  register={register}
                  errors={errors}
                  fieldClassName={fieldStyle}
                  labelClassName={cn(labelStyle, 'text-muted-foreground')}
                  disabled={isSubmitting}
                />

                {/* Tax Total */}
                <CustomFormField
                  name='tax_amount'
                  label='Tax Total'
                  type='number'
                  placeholder='0.00'
                  register={register}
                  errors={errors}
                  fieldClassName={fieldStyle}
                  labelClassName={cn(labelStyle, 'text-muted-foreground')}
                  disabled={isSubmitting}
                />

                {/* Discount */}
                <CustomFormField
                  name='discount_amount'
                  label='Discount (-)'
                  type='number'
                  placeholder='0.00'
                  register={register}
                  errors={errors}
                  fieldClassName={fieldStyle}
                  labelClassName={cn(labelStyle, 'text-orange-500')}
                  disabled={isSubmitting}
                />

                {/* Total Amount — read-only, auto-calculated */}
                <CustomFormField
                  name='total_amount'
                  label='Total Amount'
                  readonly={true}
                  register={register}
                  fieldClassName={fieldStyle}
                  labelClassName={cn(labelStyle, 'font-semibold')}
                  className='font-semibold bg-muted cursor-default'
                  value={`$${Number(watch('total_amount') || 0).toFixed(2)}`}
                />

                <div className='border-t border-light/50 my-2' />

                {/* Vendor Invoice Total */}
                <CustomFormField
                  name='vendor_invoice_total'
                  label='Vendor Invoice Total'
                  type='number'
                  placeholder='0.00'
                  register={register}
                  errors={errors}
                  fieldClassName={fieldStyle}
                  labelClassName={cn(labelStyle, 'text-muted-foreground')}
                  disabled={isSubmitting}
                />

                {/* Adjustment Amount (+/-) */}
                <CustomFormField
                  name='adjustment_amount'
                  label='+/-'
                  type='number'
                  placeholder='0.00'
                  register={register}
                  errors={errors}
                  fieldClassName={fieldStyle}
                  labelClassName={cn(labelStyle, 'text-muted-foreground')}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default UpdateMaterialJobModal
