'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ClientService from '@/services/api/clients/clients.service'

export type LeadStage =
  | 'prospect'
  | 'open'
  | 'working'
  | 'meeting-set'
  | 'opportunity'
  | 'closed-won'
  | 'closed-lost'

const LEAD_STAGE_OPTIONS: { value: LeadStage; label: string }[] = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'open', label: 'Open' },
  { value: 'working', label: 'Working' },
  { value: 'meeting-set', label: 'Meeting Set' },
  { value: 'opportunity', label: 'Opportunity' },
  { value: 'closed-won', label: 'Closed Won' },
  { value: 'closed-lost', label: 'Closed Lost' }
]

interface ChangeLeadStageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string | null
  currentStage: LeadStage | null
  onSuccess: (clientId: string, stage: LeadStage) => void
}

const ChangeLeadStageModal: React.FC<ChangeLeadStageModalProps> = ({
  open,
  onOpenChange,
  clientId,
  currentStage,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stage, setStage] = useState<LeadStage>('prospect')

  useEffect(() => {
    if (open) {
      setStage(currentStage || 'prospect')
    }
  }, [open, currentStage])

  const stageLabel = useMemo(() => {
    return LEAD_STAGE_OPTIONS.find(option => option.value === stage)?.label || 'Select stage'
  }, [stage])

  const handleSubmit = async () => {
    if (!clientId) {
      return
    }

    try {
      setIsSubmitting(true)
      await ClientService.updateLeadStage(clientId, stage)
      onSuccess(clientId, stage)
      toast.success('Lead stage updated successfully')
      onOpenChange(false)
    } catch (error: any) {
      toast.error(typeof error?.message === 'string' ? error.message : 'Failed to update lead stage')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Change Lead Stage'
      description='Select a new stage for this lead.'
      maxWidth='sm'
      disableClose={isSubmitting}
      isLoading={isSubmitting}
      actions={
        <>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type='button' onClick={handleSubmit} disabled={isSubmitting || !clientId}>
            Update Stage
          </Button>
        </>
      }
    >
      <div className='space-y-2'>
        <p className='text-sm text-muted-foreground'>Current selection: {stageLabel}</p>
        <Select value={stage} onValueChange={value => setStage(value as LeadStage)} disabled={isSubmitting}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Select stage' />
          </SelectTrigger>
          <SelectContent>
            {LEAD_STAGE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </CommonDialog>
  )
}

export default ChangeLeadStageModal