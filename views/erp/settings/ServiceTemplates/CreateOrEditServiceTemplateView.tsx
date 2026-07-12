'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeftIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ProductCategory,
  ProposalServiceItemPayload,
  ServiceTemplate,
  ServiceTemplatePayload,
  ServiceType,
  Unit,
  Vendor
} from '@/types'
import ServiceTemplateService from '@/services/api/settings/service_templates.service'
import ServiceTypeSection from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/ServiceTypeSection'
import { extractServiceLineErrors, hasServiceLineErrors, ServiceLineErrors } from '@/utils/service-line-validation'
import CustomFormField from '@/components/form/CustomFormField'

const CreateOrEditServiceTemplateView = ({
  template: initialTemplate,
  serviceTypes = [],
  units = [],
  productCategories = [],
  uomUnits = [],
  vendors = []
}: {
  template?: ServiceTemplate | null
  serviceTypes: ServiceType[]
  units: Unit[]
  productCategories: ProductCategory[]
  uomUnits: Unit[]
  vendors: Vendor[]
}) => {
  const router = useRouter()

  const isEditMode = !!initialTemplate
  const [isLoading, setIsLoading] = useState(false)
  const [serviceFieldErrors, setServiceFieldErrors] = useState<ServiceLineErrors>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [title, setTitle] = useState(initialTemplate?.title || '')
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string>(initialTemplate?.service_type_id || '')
  const [lines, setLines] = useState<ProposalServiceItemPayload[]>([])

  useEffect(() => {
    if (initialTemplate?.service) {
      const items = initialTemplate.service.items || []

      setLines(
        items.map(item => ({
          item_id: item.id,
          product_id: item.product_id,
          product: item?.product,
          labor_cost_id: item.labor_cost_id,
          name: item.name,
          description: item.description,
          sku: item.sku ?? '',
          style: item.style ?? '',
          color: item.color ?? '',
          type: item.type,
          unit_cost: item.unit_cost,
          qty: item.qty,
          unit_name: item.unit_name || '',
          unit_id: item.unit_id ?? '',
          total_cost: item.total_cost,
          margin: item.margin,
          unit_price: item.unit_price,
          discount: item.discount,
          discount_type: item.discount_type,
          freight_charge: item.freight_charge,
          is_sale: item.is_sale,
          tax_type: item.tax_type,
          tax: item.tax,
          tax_amount: item.total_tax,
          total_price: item.total_price,
          note: item.note || ''
        }))
      )
    }

    setHasUnsavedChanges(false)
  }, [initialTemplate])

  const selectedServiceType = serviceTypes.find(st => st.id === selectedServiceTypeId)

  const buildPayload = (): ServiceTemplatePayload => ({
    title,
    service_type_id: selectedServiceTypeId,
    service: {
      service_type_id: selectedServiceTypeId,
      group_id: initialTemplate?.service?.id ?? null,
      items: lines.map(line => ({
        item_id: line.item_id ?? null,
        product_id: line.product_id,
        labor_cost_id: line.labor_cost_id,
        name: line.name,
        description: line.description,
        type: line.type,
        sku: line.sku ?? '',
        style: line.style ?? '',
        color: line.color ?? '',
        unit_cost: line.unit_cost,
        qty: line.qty,
        unit_name: line.unit_name,
        unit_id: line.unit_id,
        total_cost: line.total_cost,
        margin: line.margin,
        unit_price: line.unit_price,
        discount: line.discount,
        discount_type: line.discount_type,
        freight_charge: line.freight_charge,
        is_sale: line.is_sale,
        tax_type: line.tax_type,
        tax: line.tax,
        tax_amount: line.tax_amount,
        total_price: line.total_price,
        note: line.note
      }))
    }
  })

  const onSubmit = async () => {
    if (!title) {
      toast.error('Please enter a template title')

      return
    }

    if (!selectedServiceTypeId) {
      toast.error('Please select a service type')

      return
    }

    setIsLoading(true)
    setServiceFieldErrors({})

    try {
      const payload = buildPayload()

      if (isEditMode) {
        await ServiceTemplateService.update(initialTemplate!.id, payload)
        toast.success('Service template updated successfully')
      } else {
        await ServiceTemplateService.store(payload)
        toast.success('Service template created successfully')
      }

      router.push('/erp/settings/service-templates')
    } catch (error: any) {
      const lineErrors = extractServiceLineErrors(error)

      if (hasServiceLineErrors(lineErrors)) {
        // map errors to group 0 since we only have 1 group
        setServiceFieldErrors({ 0: lineErrors[0] || lineErrors })
        toast.error('Please fix the highlighted service fields and try again.')

        return
      }

      toast.error(error?.message || 'Failed to save service template')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='space-y-4 '>
      {/* Page Header */}
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <div className='flex items-center gap-3'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => router.push('/erp/settings/service-templates')}
            disabled={isLoading}
          >
            <ChevronLeftIcon className='h-4 w-4 mr-1' />
            Back
          </Button>
          <div>
            <h1 className='text-xl font-bold'>{isEditMode ? 'Edit Service Template' : 'Create Service Template'}</h1>
            <p className='text-sm text-zinc-400'>
              {isEditMode ? 'Update existing template services' : 'Add services to a new template'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/erp/settings/service-templates')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type='button' onClick={onSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditMode ? 'Update Template' : 'Save Template'}
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card className='bg-accent/20 border-accent col-span-2'>
          <CardContent className='p-4 space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <CustomFormField
              name='title'
              label='Template Title'
              type='text'
              placeholder='Enter Template Title'
              value={title}
              onChange={val => {
                setTitle(val as string)
                setHasUnsavedChanges(true)
              }}
              rules={{ required: true }}
            />
            <CustomFormField
              name='service_type'
              label='Service Type'
              type='select'
              selectOptions={serviceTypes.map(st => ({ label: st.name, value: st.id }))}
              value={selectedServiceTypeId}
              onChange={val => {
                const newId = val as string

                if (newId !== selectedServiceTypeId) {
                  setSelectedServiceTypeId(newId)

                  if (!isEditMode) {
                    setLines([]) // clear lines if switching type in create mode
                  }

                  setHasUnsavedChanges(true)
                }
              }}
              placeholder='Select a Service Type'
              rules={{ required: true }}
            />
          </CardContent>
        </Card>
      </div>

      {selectedServiceType ? (
        <ServiceTypeSection
          mode='create'
          serviceTypeName={selectedServiceType.name}
          serviceTypeId={selectedServiceType.id}
          onRemove={() => {}} // No-op, we don't remove it here
          serviceTypes={serviceTypes}
          units={units}
          lines={lines}
          onLinesChange={newLines => {
            setLines(newLines)
            setHasUnsavedChanges(true)
          }}
          productCategories={productCategories}
          uomUnits={uomUnits}
          vendors={vendors}
          taxRate={0} // No tax calculation by default on templates?
          lineErrors={serviceFieldErrors[0]}
        />
      ) : (
        <div className='flex items-center justify-center h-32 bg-zinc-800 rounded-md border border-zinc-700 border-dashed'>
          <p className='text-zinc-400 text-sm'>Please select a Service Type above to add items.</p>
        </div>
      )}
    </div>
  )
}

export default CreateOrEditServiceTemplateView
