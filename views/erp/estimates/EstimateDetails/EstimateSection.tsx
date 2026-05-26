import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import {
  BusinessLocation,
  Client,
  Estimate,
  EstimatePayload,
  EstimateType,
  PaymentTerm,
  ServiceType,
  Staff
} from '@/types'
import { formatDate, formatDateTime } from '@/utils/date'
import { KeyboardEventHandler, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { hasPermission } from '@/utils/role-permission'
import { Check, PencilLine, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import CustomFormField from '@/components/form/CustomFormField'
import EstimateService from '@/services/api/estimates/estimates.service'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const EstimateSection = ({
  estimateId,
  estimate,
  serviceTypes,
  estimateTypes,
  clients,
  staffs,
  paymentTerms,
  businessLocations
}: {
  estimateId: string
  estimate: Estimate
  serviceTypes: ServiceType[]
  estimateTypes: EstimateType[]
  clients: Client[]
  staffs: Staff[]
  paymentTerms: PaymentTerm[]
  businessLocations: BusinessLocation[]
}) => {
  const [canEditEstimate, setCanEditEstimate] = useState<boolean>(false)
  const [currentEstimate, setCurrentEstimate] = useState<Estimate>(estimate)
  const estimateRef = useRef<Estimate>(estimate)
  const [editingField, setEditingField] = useState<InlineEditableField | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve())
  const lastInlineSaveRequestIdRef = useRef(0)

  // Check permissions
  useEffect(() => {
    hasPermission('Update Estimate').then(result => setCanEditEstimate(result))
  }, [])

  useEffect(() => {
    setCurrentEstimate(estimate)
    estimateRef.current = estimate
  }, [estimate])

  const startInlineEdit = (field: InlineEditableField, value?: string) => {
    if (!canEditEstimate) return

    setEditingField(field)
    setEditingValue(value ?? '')
  }

  const cancelInlineEdit = () => {
    setEditingField(null)
    setEditingValue('')
  }

  const enqueueSave = (executor: () => Promise<void>) => {
    saveQueueRef.current = saveQueueRef.current.then(executor).catch(() => {
      // Keep queue alive for later updates.
    })
  }

  const loadEstimateDetails = async () => {
    if (!estimateId) return

    try {
      const response = await EstimateService.show(estimateId)
      const estimateData = response?.data as Estimate

      setCurrentEstimate(estimateData)
      estimateRef.current = estimateData
      cancelInlineEdit()
    } catch (error: any) {
      toast.error(typeof error?.message === 'string' ? error.message : 'Failed to load estimate details')
    }
  }

  const formatDeliveryDatetime = (value: string | number | null | undefined) => {
    if (!value) return null

    const d = typeof value === 'number' ? new Date(value) : new Date(String(value).replace(' ', 'T'))

    if (Number.isNaN(d.getTime())) return String(value)

    const pad = (n: number) => String(n).padStart(2, '0')

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}:${pad(d.getSeconds())}`
  }

  const buildEstimatePayload = (sourceEstimate: Estimate, overrides: Partial<Estimate> = {}): EstimatePayload => {
    const mergedEstimate = { ...sourceEstimate, ...overrides }

    const estimateTypeName =
      estimateTypes.find(type => type.id === mergedEstimate.estimate_type_id)?.name ||
      mergedEstimate.estimate_type?.name ||
      ''

    const isMaterialOnly = estimateTypeName === 'Material Only'

    const payload: EstimatePayload = {
      title: mergedEstimate.title || '',
      service_type_id: mergedEstimate.service_type_id || '',
      estimate_type_id: mergedEstimate.estimate_type_id || '',
      client_id: mergedEstimate.client_id || '',
      assign_id: mergedEstimate.assign_id || '',
      payment_term_id: mergedEstimate.payment_term_id || '',
      address_id: mergedEstimate.address_id ?? '',
      location_id: mergedEstimate.location_id ?? '',
      expiration_date: mergedEstimate.expiration_date || '',
      biding_date: mergedEstimate.biding_date || '',
      tax_rate: mergedEstimate.tax_rate ?? 0
    }

    if (isMaterialOnly) {
      payload.interaction = mergedEstimate.interaction || ''

      if (mergedEstimate.interaction === 'cash_and_pickup') {
        payload.pickup_date = mergedEstimate.pickup_date || ''
        payload.pickup_location_id = mergedEstimate.pickup_location_id || ''
        payload.pickup_notes = mergedEstimate.pickup_notes || ''
      }

      if (mergedEstimate.interaction === 'cash_and_delivery') {
        payload.delivery_datetime = formatDeliveryDatetime(mergedEstimate.delivery_datetime)
        payload.delivery_location = mergedEstimate.delivery_location || ''
        payload.delivery_notes = mergedEstimate.delivery_notes || ''
      }
    }

    return payload
  }

  const saveInlineField = async (field: InlineEditableField, explicitValue?: string | number | null) => {
    if (!estimateId) return

    const baseEstimate = estimateRef.current

    if (!baseEstimate) return

    const rawValue = explicitValue ?? editingValue

    const nextValue =
      field === 'tax_rate'
        ? Number(rawValue ?? 0)
        : field === 'delivery_datetime'
          ? rawValue
            ? String(rawValue)
            : ''
          : String(rawValue ?? '')

    const currentValue =
      field === 'tax_rate'
        ? Number(baseEstimate.tax_rate ?? 0)
        : field === 'delivery_datetime'
          ? String(baseEstimate.delivery_datetime ?? '')
          : String((baseEstimate as any)[field] ?? '')

    if (nextValue === currentValue) {
      cancelInlineEdit()

      return
    }

    const queuedRequestId = ++lastInlineSaveRequestIdRef.current

    const selectedClient = field === 'client_id' ? clients.find(client => client.id === String(nextValue)) : undefined

    const selectedEstimateType =
      field === 'estimate_type_id' ? estimateTypes.find(type => type.id === String(nextValue)) : undefined

    const selectedAssignUser = field === 'assign_id' ? staffs.find(staff => staff.id === String(nextValue)) : undefined

    const selectedPaymentTerm =
      field === 'payment_term_id' ? paymentTerms.find(term => term.id === String(nextValue)) : undefined

    const selectedLocation =
      field === 'location_id' ? businessLocations.find(loc => loc.id === String(nextValue)) : undefined

    const selectedPickupLocation =
      field === 'pickup_location_id' ? businessLocations.find(loc => loc.id === String(nextValue)) : undefined

    const selectedClientAddresses = selectedClient?.addresses || []
    const defaultAddressId = selectedClientAddresses.find(addr => addr.is_default === 1)?.id ?? ''

    const selectedAddress =
      field === 'address_id'
        ? selectedClientAddresses.find(addr => addr.id === String(nextValue))
        : selectedClientAddresses.find(addr => addr.id === defaultAddressId)

    const nextOverrides: Partial<Estimate> = {
      [field]: nextValue
    }

    if (field === 'client_id') {
      nextOverrides.client_id = String(nextValue)
      nextOverrides.client = selectedClient || baseEstimate.client
      nextOverrides.address_id = defaultAddressId
      nextOverrides.address = selectedAddress || null
    }

    if (field === 'address_id') {
      nextOverrides.address_id = String(nextValue)
      nextOverrides.address = selectedAddress || baseEstimate.address || null
    }

    if (field === 'location_id') {
      nextOverrides.location_id = String(nextValue)
      nextOverrides.location = selectedLocation || baseEstimate.location || null

      if (selectedLocation?.sales_tax) {
        nextOverrides.tax_rate = selectedLocation.sales_tax
      }
    }

    if (field === 'estimate_type_id') {
      nextOverrides.estimate_type_id = String(nextValue)
      nextOverrides.estimate_type = selectedEstimateType || baseEstimate.estimate_type
    }

    if (field === 'assign_id') {
      nextOverrides.assign_id = String(nextValue)
      nextOverrides.assign_user = selectedAssignUser || baseEstimate.assign_user
    }

    if (field === 'payment_term_id') {
      nextOverrides.payment_term_id = String(nextValue)
      nextOverrides.payment_term = selectedPaymentTerm || baseEstimate.payment_term
    }

    if (field === 'pickup_location_id') {
      nextOverrides.pickup_location_id = String(nextValue)
      nextOverrides.pickup_location = selectedPickupLocation || baseEstimate.pickup_location || null
    }

    if (field === 'delivery_datetime') {
      nextOverrides.delivery_datetime = nextValue ? String(nextValue) : null
    }

    if (field === 'interaction') {
      nextOverrides.interaction = String(nextValue) as Estimate['interaction']
      nextOverrides.pickup_date = ''
      nextOverrides.pickup_location_id = ''
      nextOverrides.pickup_location = null
      nextOverrides.pickup_notes = ''
      nextOverrides.delivery_datetime = null
      nextOverrides.delivery_location = ''
      nextOverrides.delivery_notes = ''
    }

    cancelInlineEdit()

    setCurrentEstimate(prev => {
      const nextEstimate = { ...prev, ...nextOverrides }

      estimateRef.current = nextEstimate

      return nextEstimate
    })

    enqueueSave(async () => {
      const latestEstimate = estimateRef.current

      if (!latestEstimate) return

      try {
        const payload = buildEstimatePayload(latestEstimate, nextOverrides)
        const response = await EstimateService.update(estimateId, payload)
        const updatedEstimate = response?.data as Estimate | undefined
        const isLatestInlineRequest = queuedRequestId === lastInlineSaveRequestIdRef.current

        if (updatedEstimate?.id && isLatestInlineRequest) {
          setCurrentEstimate(updatedEstimate)
          estimateRef.current = updatedEstimate
        }
      } catch (error: any) {
        const isLatestInlineRequest = queuedRequestId === lastInlineSaveRequestIdRef.current

        if (isLatestInlineRequest) {
          toast.error(typeof error?.message === 'string' ? error.message : 'Failed to update estimate')
          await loadEstimateDetails()
        }
      }
    })
  }

  useEffect(() => {
    if (!editingField) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null

      if (!target) return

      const isInsideInlineEditor = target.closest('[data-inline-editor]')
      const isInsideFloatingLayer = target.closest('[data-radix-popper-content-wrapper], [data-radix-portal]')

      if (isInsideInlineEditor || isInsideFloatingLayer) return

      const shouldSaveOnOutsideClick: InlineEditableField[] = []

      if (shouldSaveOnOutsideClick.includes(editingField)) {
        void saveInlineField(editingField)

        return
      }

      cancelInlineEdit()
    }

    document.addEventListener('pointerdown', handlePointerDown, true)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
    }
  }, [editingField, cancelInlineEdit, saveInlineField])

  type InlineEditableField =
    | 'title'
    | 'estimate_type_id'
    | 'interaction'
    | 'pickup_date'
    | 'pickup_location_id'
    | 'pickup_notes'
    | 'delivery_datetime'
    | 'delivery_location'
    | 'delivery_notes'
    | 'location_id'
    | 'address_id'
    | 'client_id'
    | 'assign_id'
    | 'payment_term_id'
    | 'expiration_date'
    | 'biding_date'
    | 'tax_rate'

  const statuslessTitle = useMemo(() => currentEstimate.title || '-', [currentEstimate.title])
  const selectedClient = clients.find(client => client.id === currentEstimate.client_id)
  const addressOptions = selectedClient?.addresses || currentEstimate.client?.addresses || []

  const addressSelectOptions = addressOptions.map(address => {
    const value = [address.street_address, address.city?.name, address.state?.name, address.zip_code]
      .filter(Boolean)
      .join(', ')

    return {
      value: address.id,
      label: `${address.title} - ${value}`
    }
  })

  const staffSelectOptions = staffs.map(staff => ({ value: staff.id, label: `${staff.first_name} ${staff.last_name}` }))
  const estimateTypeSelectOptions = estimateTypes.map(type => ({ value: type.id, label: type.name }))

  const clientSelectOptions = clients.map(client => ({
    value: client.id,
    label: `${client.first_name} ${client.last_name}`.trim()
  }))

  const paymentTermOptions = paymentTerms.map(term => ({ value: term.id, label: term.name }))
  const businessLocationOptions = businessLocations.map(location => ({ value: location.id, label: location.name }))

  const isMaterialOnly =
    estimateTypes.find(type => type.id === currentEstimate.estimate_type_id)?.name === 'Material Only'

  const renderEditableDisplay = (
    field: InlineEditableField,
    content: ReactNode,
    startValue?: string,
    align: 'items-center' | 'items-start' = 'items-center'
  ) => (
    <div
      className={cn(
        'group flex justify-between gap-2 hover:bg-accent/40 px-2.5 py-1.5 rounded-md transition-colors duration-100',
        align,
        canEditEstimate && 'cursor-pointer'
      )}
      onClick={() => startInlineEdit(field, startValue)}
    >
      <div className='flex-1'>{content}</div>
      {canEditEstimate && (
        <PencilLine
          className={cn(
            'size-4 text-white opacity-0 transition-opacity group-hover:opacity-100',
            align === 'items-start' && 'mt-0.5'
          )}
        />
      )}
    </div>
  )

  const renderInlineActions = (onSave: () => void) => (
    <div className='absolute -bottom-6 right-1 z-10 flex gap-2'>
      <Button
        type='button'
        variant='primary'
        size='icon'
        className='size-6 rounded-xs shadow-sm shadow-[#929292]/40 bg-white hover:bg-white/90 text-black'
        onClick={onSave}
        aria-label='Save'
      >
        <Check className='size-4' />
      </Button>
      <Button
        type='button'
        variant='outline'
        size='icon'
        className='size-6 rounded-xs shadow-sm shadow-[#929292]/40'
        onClick={cancelInlineEdit}
        aria-label='Cancel'
      >
        <X className='size-4' />
      </Button>
    </div>
  )

  const renderInlineEditor = (
    content: ReactNode,
    onSave: () => void,
    options?: { className?: string; onKeyDown?: KeyboardEventHandler<HTMLDivElement> }
  ) => (
    <div data-inline-editor className={cn('relative', options?.className)} onKeyDown={options?.onKeyDown}>
      {content}
      {renderInlineActions(onSave)}
    </div>
  )

  type RowConfig = {
    field: InlineEditableField
    label: string
    align?: 'items-center' | 'items-start'
    renderDisplay: () => ReactNode
    renderEditor: () => ReactNode
    visible?: boolean
  }

  const rows: RowConfig[] = [
    {
      field: 'title',
      label: 'Estimate Title',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='text'
            name='title'
            value={editingValue || currentEstimate.title || ''}
            autoFocus
            onChange={value => setEditingValue(String(value ?? ''))}
          />,
          () => saveInlineField('title'),
          {
            onKeyDown: event => {
              if (event.key === 'Enter') {
                event.preventDefault()
                saveInlineField('title')
              }

              if (event.key === 'Escape') {
                event.preventDefault()
                cancelInlineEdit()
              }
            }
          }
        ),
      renderDisplay: () =>
        renderEditableDisplay('title', <p className='text-sm leading-none'>{statuslessTitle}</p>, currentEstimate.title)
    },
    {
      field: 'estimate_type_id',
      label: 'Estimate Type',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='select'
            name='estimate_type_id'
            placeholder='Select estimate type'
            value={editingValue || currentEstimate.estimate_type_id || ''}
            autoFocus
            selectOptions={estimateTypeSelectOptions}
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
          />,
          () => saveInlineField('estimate_type_id')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'estimate_type_id',
          <p className='text-sm leading-none'>{currentEstimate.estimate_type?.name || '-'}</p>,
          currentEstimate.estimate_type_id || ''
        )
    },
    {
      field: 'interaction',
      label: 'Interaction',
      visible: isMaterialOnly,
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='select'
            name='interaction'
            placeholder='Select interaction'
            value={editingValue || currentEstimate.interaction || ''}
            autoFocus
            selectOptions={[
              { value: 'cash_and_pickup', label: 'Cash and Pickup' },
              { value: 'cash_and_delivery', label: 'Cash and Delivery' }
            ]}
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
          />,
          () => saveInlineField('interaction')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'interaction',
          <p className='text-sm leading-none'>
            {currentEstimate.interaction === 'cash_and_pickup'
              ? 'Cash and Pickup'
              : currentEstimate.interaction === 'cash_and_delivery'
                ? 'Cash and Delivery'
                : '-'}
          </p>,
          currentEstimate.interaction || ''
        )
    },
    {
      field: 'pickup_date',
      label: 'Pickup Date',
      visible: isMaterialOnly && currentEstimate.interaction === 'cash_and_pickup',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='datepicker'
            name='pickup_date'
            placeholder='Select pickup date'
            value={editingValue || currentEstimate.pickup_date || ''}
            autoFocus
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
          />,
          () => saveInlineField('pickup_date')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'pickup_date',
          <p className='text-sm leading-none'>{formatDate(currentEstimate.pickup_date ?? null) || '-'}</p>,
          currentEstimate.pickup_date || ''
        )
    },
    {
      field: 'pickup_location_id',
      label: 'Pickup Location',
      visible: isMaterialOnly && currentEstimate.interaction === 'cash_and_pickup',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='select'
            name='pickup_location_id'
            placeholder='Select pickup location'
            value={editingValue || currentEstimate.pickup_location_id || ''}
            autoFocus
            selectOptions={businessLocationOptions}
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
          />,
          () => saveInlineField('pickup_location_id')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'pickup_location_id',
          <p className='text-sm leading-none'>{currentEstimate.pickup_location?.name || '-'}</p>,
          currentEstimate.pickup_location_id || ''
        )
    },
    {
      field: 'pickup_notes',
      label: 'Pickup Notes',
      align: 'items-start',
      visible: isMaterialOnly && currentEstimate.interaction === 'cash_and_pickup',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='textarea'
            name='pickup_notes'
            value={editingValue || currentEstimate.pickup_notes || ''}
            className='min-h-20'
            autoFocus
            onChange={value => setEditingValue(String(value ?? ''))}
          />,
          () => saveInlineField('pickup_notes'),
          {
            onKeyDown: event => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault()
                saveInlineField('pickup_notes')
              }

              if (event.key === 'Escape') {
                event.preventDefault()
                cancelInlineEdit()
              }
            }
          }
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'pickup_notes',
          <p className='text-sm leading-none whitespace-pre-wrap'>{currentEstimate.pickup_notes || '-'}</p>,
          currentEstimate.pickup_notes || '',
          'items-start'
        )
    },
    {
      field: 'delivery_datetime',
      label: 'Delivery Datetime',
      visible: isMaterialOnly && currentEstimate.interaction === 'cash_and_delivery',
      renderEditor: () =>
        renderInlineEditor(
          <DateTimePicker
            value={
              editingValue
                ? new Date(editingValue.replace(' ', 'T')).getTime()
                : currentEstimate.delivery_datetime
                  ? new Date(String(currentEstimate.delivery_datetime).replace(' ', 'T')).getTime()
                  : null
            }
            onChange={value => {
              if (value === null) {
                setEditingValue('')

                return
              }

              const formatted = formatDeliveryDatetime(value)

              setEditingValue(formatted || '')
            }}
            placeholder='Select delivery date & time'
          />,
          () => saveInlineField('delivery_datetime')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'delivery_datetime',
          <p className='text-sm leading-none'>
            {currentEstimate.delivery_datetime ? formatDateTime(currentEstimate.delivery_datetime) : '-'}
          </p>,
          currentEstimate.delivery_datetime || ''
        )
    },
    {
      field: 'delivery_location',
      label: 'Delivery Location',
      visible: isMaterialOnly && currentEstimate.interaction === 'cash_and_delivery',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='text'
            name='delivery_location'
            value={editingValue || currentEstimate.delivery_location || ''}
            autoFocus
            onChange={value => setEditingValue(String(value ?? ''))}
          />,
          () => saveInlineField('delivery_location'),
          {
            onKeyDown: event => {
              if (event.key === 'Enter') {
                event.preventDefault()
                saveInlineField('delivery_location')
              }

              if (event.key === 'Escape') {
                event.preventDefault()
                cancelInlineEdit()
              }
            }
          }
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'delivery_location',
          <p className='text-sm leading-none'>{currentEstimate.delivery_location || '-'}</p>,
          currentEstimate.delivery_location || ''
        )
    },
    {
      field: 'delivery_notes',
      label: 'Delivery Notes',
      align: 'items-start',
      visible: isMaterialOnly && currentEstimate.interaction === 'cash_and_delivery',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='textarea'
            name='delivery_notes'
            value={editingValue || currentEstimate.delivery_notes || ''}
            className='min-h-20'
            autoFocus
            onChange={value => setEditingValue(String(value ?? ''))}
          />,
          () => saveInlineField('delivery_notes'),
          {
            onKeyDown: event => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault()
                saveInlineField('delivery_notes')
              }

              if (event.key === 'Escape') {
                event.preventDefault()
                cancelInlineEdit()
              }
            }
          }
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'delivery_notes',
          <p className='text-sm leading-none whitespace-pre-wrap'>{currentEstimate.delivery_notes || '-'}</p>,
          currentEstimate.delivery_notes || '',
          'items-start'
        )
    },
    {
      field: 'client_id',
      label: 'Customer',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='combobox'
            name='client_id'
            placeholder='Select customer'
            value={editingValue || currentEstimate.client_id || ''}
            autoFocus
            selectOptions={clientSelectOptions}
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
          />,
          () => saveInlineField('client_id')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'client_id',
          <p className='text-sm leading-none'>
            {[currentEstimate.client?.first_name, currentEstimate.client?.last_name].filter(Boolean).join(' ') || '-'}
          </p>,
          currentEstimate.client_id || ''
        )
    },
    {
      field: 'location_id',
      label: 'Business Location',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='select'
            name='location_id'
            placeholder='Select business location'
            value={editingValue || currentEstimate.location_id || ''}
            autoFocus
            selectOptions={businessLocationOptions}
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
          />,
          () => saveInlineField('location_id')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'location_id',
          <p className='text-sm leading-tight'>{currentEstimate.location?.name}</p>,
          currentEstimate.location_id || ''
        )
    },
    {
      field: 'address_id',
      label: 'Event Location',
      align: 'items-start',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='select'
            name='address_id'
            placeholder={addressSelectOptions.length ? 'Select address' : 'No addresses found'}
            value={editingValue || currentEstimate.address_id || ''}
            autoFocus
            selectOptions={addressSelectOptions}
            disabled={addressSelectOptions.length === 0}
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
            className='whitespace-normal text-left leading-snug h-auto!'
          />,
          () => saveInlineField('address_id')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'address_id',
          <p className='text-sm'>
            {estimateRef.current.address?.title}
            {' - '}
            {[
              currentEstimate.address?.street_address,
              currentEstimate.address?.city?.name,
              [currentEstimate.address?.state?.name, currentEstimate.address?.zip_code].filter(Boolean).join(' ')
            ]
              .filter(Boolean)
              .join(', ') || '-'}
          </p>,
          currentEstimate.address_id || '',
          'items-start'
        )
    },
    {
      field: 'assign_id',
      label: 'Assigned Estimator',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='combobox'
            name='assign_id'
            placeholder='Select estimator'
            value={editingValue || currentEstimate.assign_id || ''}
            autoFocus
            selectOptions={staffSelectOptions}
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
          />,
          () => saveInlineField('assign_id')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'assign_id',
          <p className='text-sm leading-none'>
            {[currentEstimate.assign_user?.first_name, currentEstimate.assign_user?.last_name]
              .filter(Boolean)
              .join(' ') || '-'}
          </p>,
          currentEstimate.assign_id || ''
        )
    },
    {
      field: 'payment_term_id',
      label: 'Payment Terms',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='select'
            name='payment_term_id'
            placeholder='Select payment term'
            value={editingValue || currentEstimate.payment_term_id || ''}
            autoFocus
            selectOptions={paymentTermOptions}
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
          />,
          () => saveInlineField('payment_term_id')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'payment_term_id',
          <p className='text-sm leading-none'>{currentEstimate.payment_term?.name || '-'}</p>,
          currentEstimate.payment_term_id || ''
        )
    },
    {
      field: 'expiration_date',
      label: 'Expiration Date',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='datepicker'
            name='expiration_date'
            placeholder='Select expiration date'
            value={editingValue || currentEstimate.expiration_date || ''}
            autoFocus
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
          />,
          () => saveInlineField('expiration_date')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'expiration_date',
          <p className='text-sm leading-none'>{formatDate(currentEstimate.expiration_date ?? null) || '-'}</p>,
          currentEstimate.expiration_date || ''
        )
    },
    {
      field: 'biding_date',
      label: 'Bidding Date',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='datepicker'
            name='biding_date'
            placeholder='Select bidding date'
            value={editingValue || currentEstimate.biding_date || ''}
            autoFocus
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
          />,
          () => saveInlineField('biding_date')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'biding_date',
          <p className='text-sm leading-none'>{formatDate(currentEstimate.biding_date ?? null) || '-'}</p>,
          currentEstimate.biding_date || ''
        )
    },
    {
      field: 'tax_rate',
      label: 'Tax Rate (%)',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='number'
            name='tax_rate'
            value={editingValue || String(currentEstimate.tax_rate ?? 0)}
            autoFocus
            onChange={value => setEditingValue(String(value ?? ''))}
          />,
          () => saveInlineField('tax_rate'),
          {
            onKeyDown: event => {
              if (event.key === 'Enter') {
                event.preventDefault()
                saveInlineField('tax_rate')
              }

              if (event.key === 'Escape') {
                event.preventDefault()
                cancelInlineEdit()
              }
            }
          }
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'tax_rate',
          <p className='text-sm leading-none'>{currentEstimate.tax_rate ?? 0}</p>,
          String(currentEstimate.tax_rate ?? 0)
        )
    }
  ]

  return (
    <Card className='bg-zinc-900 border-zinc-800'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-white text-base'>Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-1 mt-2'>
          <div className='grid grid-cols-[136px_minmax(0,_1fr)] gap-2 items-center'>
            <Label className='text-sm text-muted-foreground'>Estimate Number:</Label>
            <p className='text-sm leading-none px-2.5 py-1.5'>{currentEstimate.estimate_number?.toString() || '-'}</p>
          </div>

          {rows
            .filter(row => row.visible !== false)
            .map(row => (
              <div
                key={row.field}
                className={cn('grid grid-cols-[136px_minmax(0,_1fr)] gap-2', row.align ?? 'items-center')}
              >
                <Label className='text-sm text-muted-foreground'>{row.label}:</Label>
                {editingField === row.field ? row.renderEditor() : row.renderDisplay()}
              </div>
            ))}

          <div className='grid grid-cols-[136px_minmax(0,_1fr)] gap-2 items-center'>
            <Label className='text-sm text-muted-foreground'>Created At:</Label>
            <p className='text-sm leading-none px-2.5 py-1.5'>{formatDateTime(currentEstimate.created_at)}</p>
          </div>

          <div className='grid grid-cols-[136px_minmax(0,_1fr)] gap-2 items-center'>
            <Label className='text-sm text-muted-foreground'>Updated At:</Label>
            <p className='text-sm leading-none px-2.5 py-1.5'>{formatDateTime(currentEstimate.updated_at)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default EstimateSection
