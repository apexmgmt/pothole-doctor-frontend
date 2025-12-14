'use client'

import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import LeadService from '@/services/api/leads.service'
import {
  BusinessLocation,
  ClientSource,
  Company,
  InterestLevel,
  Lead,
  LeadPayload,
  ServiceType,
  Staff
} from '@/types'
import BasicLeadFields from './BasicLeadFields'
import ContactLeadFields from './ContactLeadFields'
import AdditionalLeadFields from './AdditionalLeadFields'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'

interface CreateEditLeadModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  leadId?: string | null
  leadData?: Lead | null
  onSuccess: () => void
  interestLevels: InterestLevel[]
  companies: Company[]
  staffs: Staff[]
  clientSources: ClientSource[]
  serviceTypes: ServiceType[]
  businessLocations: BusinessLocation[]
}

const CreateEditLeadModal: React.FC<CreateEditLeadModalProps> = ({
  isOpen,
  onClose,
  mode,
  leadId,
  leadData,
  onSuccess,
  interestLevels,
  companies,
  staffs,
  clientSources,
  serviceTypes,
  businessLocations
}) => {
  const methods = useForm<LeadPayload>({
    defaultValues: {
      type: 'lead',
      spouse_name: '',
      address: '',
      best_time: '',
      spouse_phone: '',
      cell_phone: '',
      cc_email: '',
      pre_qualifi_amount: 0,
      is_tax_exempt: 0,
      is_quic_book: 0,
      company_name: '',
      interest_level_id: '',
      reference_id: '',
      first_name: '',
      last_name: '',
      display_name: '',
      phone: '',
      email: '',
      source_id: '',
      lead_cost: 0,
      status: 1,
      location_id: '',
      service_type_ids: []
    }
  })

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = methods

  // Populate form data when editing
  useEffect(() => {
    if (mode === 'edit' && leadData && isOpen) {
      reset({
        type: leadData.client?.type || 'lead',
        spouse_name: leadData.spouse_name || '',
        address: leadData.address || '',
        best_time: leadData.best_time || '',
        spouse_phone: '',
        cell_phone: '',
        cc_email: leadData.cc_email || '',
        pre_qualifi_amount: Number(leadData.pre_qualifi_amount) || 0,
        is_tax_exempt: leadData.is_tax_exempt || 0,
        is_quic_book: leadData.is_quic_book || 0,
        company_name: leadData?.client?.company?.name || '',
        interest_level_id: leadData.client?.interest_level_id || '',
        reference_id: leadData.client?.reference_id || '',
        first_name: leadData.client?.first_name || '',
        last_name: leadData.client?.last_name || '',
        display_name: leadData.client?.display_name || '',
        phone: leadData?.client?.phone || '',
        email: leadData.client?.email || '',
        source_id: leadData.client?.source_id || '',
        lead_cost: Number(leadData.client?.lead_cost) || 0,
        status: leadData.client?.status || 1,
        location_id: '',
        service_type_ids: []
      })
    } else if (mode === 'create' && isOpen) {
      reset({
        type: 'lead',
        spouse_name: '',
        address: '',
        best_time: '',
        spouse_phone: '',
        cell_phone: '',
        cc_email: '',
        pre_qualifi_amount: 0,
        is_tax_exempt: 0,
        is_quic_book: 0,
        company_name: '',
        interest_level_id: '',
        reference_id: '',
        first_name: '',
        last_name: '',
        display_name: '',
        phone: '',
        email: '',
        source_id: '',
        lead_cost: 0,
        status: 1,
        location_id: '',
        service_type_ids: []
      })
    }
  }, [mode, leadData, isOpen, reset])

  const onSubmit = async (data: LeadPayload) => {
    try {
      if (mode === 'create') {
        await LeadService.store(data)
        toast.success('Lead created successfully')
      } else if (mode === 'edit' && leadId) {
        await LeadService.update(leadId, data)
        toast.success('Lead updated successfully')
      }

      onSuccess()
      onClose()
      reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save lead')
    }
  }

  const dialogActions = (
    <>
      <Button type='button' variant='outline' onClick={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button type='submit' form='lead-form' disabled={isSubmitting}>
        {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        {mode === 'create' ? 'Create Lead' : 'Update Lead'}
      </Button>
    </>
  )

  return (
    <CommonDialog
      open={isOpen}
      onOpenChange={onClose}
      title={mode === 'create' ? 'Create New Lead' : 'Edit Lead'}
      maxWidth='5xl'
      isLoading={isSubmitting}
      loadingMessage={mode === 'create' ? 'Creating lead...' : 'Updating lead...'}
      actions={dialogActions}
      disableClose={isSubmitting}
    >
      <form id='lead-form' onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <BasicLeadFields
          methods={methods}
          companies={companies}
          clientSources={clientSources}
          interestLevels={interestLevels}
          staffs={staffs}
          businessLocations={businessLocations}
        />

        <ContactLeadFields methods={methods} />

        <AdditionalLeadFields methods={methods} serviceTypes={serviceTypes} />
      </form>
    </CommonDialog>
  )
}

export default CreateEditLeadModal
