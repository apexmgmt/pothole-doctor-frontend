'use client'

import { useMemo, useState } from 'react'
import { Check, X, LogIn } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import OrganizationService from '@/services/api/organizations.service'
import OrganizationStatusSwitch from '@/views/erp/organizations/OrganizationStatusSwitch'
import { Organization, OrganizationEditPayload } from '@/types'
import { appUrl } from '@/utils/utility'

type EditableField = 'name' | 'company_name' | 'phone' | 'address' | null

interface GeneralTabProps {
  companyData: Organization
  onCompanyUpdated?: (updatedCompany: Organization) => void
  impersonateUser?: (userId: string) => Promise<void>
  isImpersonating?: boolean
  onStatusToggle?: (companyId: string) => Promise<void>
  statusLoading?: boolean
}

const getPayloadFromCompany = (company: Organization): OrganizationEditPayload => ({
  first_name: company.first_name || '',
  last_name: company.last_name || '',
  email: company.email || '',
  phone: company.userable?.phone || '',
  address: company.userable?.address || '',
  company_name: company.userable?.company_name || ''
})

const GeneralTab = ({
  companyData,
  onCompanyUpdated,
  impersonateUser,
  isImpersonating = false,
  onStatusToggle,
  statusLoading = false
}: GeneralTabProps) => {
  const [editingField, setEditingField] = useState<EditableField>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [draft, setDraft] = useState<OrganizationEditPayload>(() => getPayloadFromCompany(companyData))

  const latestPayload = useMemo(() => getPayloadFromCompany(companyData), [companyData])

  const openFieldEditor = (field: Exclude<EditableField, null>) => {
    setDraft(latestPayload)
    setEditingField(field)
  }

  const cancelEdit = () => {
    setDraft(latestPayload)
    setEditingField(null)
  }

  const updateDraft = (key: keyof OrganizationEditPayload, value: string) => {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  const submitInlineEdit = async () => {
    setIsSaving(true)

    try {
      await OrganizationService.update(String(companyData.id), draft)

      const updatedCompany = {
        ...companyData,
        first_name: draft.first_name,
        last_name: draft.last_name,
        email: draft.email,
        userable: {
          ...companyData.userable,
          phone: draft.phone,
          address: draft.address,
          company_name: draft.company_name
        }
      }

      onCompanyUpdated?.(updatedCompany as Organization)
      setEditingField(null)
      toast.success('Company updated successfully')
    } catch (error: any) {
      if (error?.errors && typeof error.errors === 'object') {
        Object.values(error.errors).forEach((errMsg: any) => {
          errMsg?.map((msg: string) => toast.error(msg))
        })
      } else {
        toast.error(error?.message || 'Something went wrong')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const ActionButtons = () => (
    <div className='flex items-center gap-2'>
      <Button
        type='button'
        size='icon'
        variant='default'
        className='h-8 w-8'
        onClick={submitInlineEdit}
        disabled={isSaving}
      >
        <Check className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        size='icon'
        variant='outline'
        className='h-8 w-8 border-border text-light hover:bg-bg-3'
        onClick={cancelEdit}
        disabled={isSaving}
      >
        <X className='h-4 w-4' />
      </Button>
    </div>
  )

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-light'>Company Details</h3>
        {impersonateUser && (
          <Button
            onClick={() => impersonateUser(String(companyData.id))}
            disabled={isImpersonating}
            variant='ghost'
            size='sm'
          >
            <LogIn className='h-4 w-4' /> Impersonate
          </Button>
        )}
      </div>

      <div className='space-y-5'>
        <div className='grid grid-cols-1 2xl:grid-cols-2 gap-6'>
          <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
            <label className='text-xs text-gray uppercase block w-25'>Name : </label>
            {editingField === 'name' ? (
              <div className='flex w-full items-center gap-2'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1'>
                  <Input
                    value={draft.first_name}
                    onChange={e => updateDraft('first_name', e.target.value)}
                    placeholder='First name'
                    className='bg-bg-3 border-border text-light placeholder:text-gray h-9'
                  />
                  <Input
                    value={draft.last_name}
                    onChange={e => updateDraft('last_name', e.target.value)}
                    placeholder='Last name'
                    className='bg-bg-3 border-border text-light placeholder:text-gray h-9'
                  />
                </div>
                <ActionButtons />
              </div>
            ) : (
              <button
                type='button'
                onClick={() => openFieldEditor('name')}
                className='text-light text-left hover:text-primary transition-colors'
              >
                {companyData.first_name || ''} {companyData.last_name || ''}
              </button>
            )}
          </div>
        </div>
        <div className='grid grid-cols-1 2xl:grid-cols-2 gap-6'>
          <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
            <label className='text-xs text-gray uppercase block w-25'>Company : </label>
            {editingField === 'company_name' ? (
              <div className='flex w-full items-center gap-2'>
                <Input
                  value={draft.company_name}
                  onChange={e => updateDraft('company_name', e.target.value)}
                  placeholder='Company name'
                  className='bg-bg-3 border-border text-light placeholder:text-gray h-9 flex-1'
                />
                <ActionButtons />
              </div>
            ) : (
              <button
                type='button'
                onClick={() => openFieldEditor('company_name')}
                className='text-light text-left hover:text-primary transition-colors'
              >
                {companyData.userable?.company_name || ' - '}
              </button>
            )}
          </div>
          <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
            <label className='text-xs text-gray uppercase block w-25'>Domain : </label>
            <p className='text-light break-all'>{appUrl(companyData.domain?.domain) || ' - '}</p>
          </div>
        </div>
        <div className='grid grid-cols-1 2xl:grid-cols-2 gap-6'>
          <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
            <label className='text-xs text-gray uppercase block w-25'>Email : </label>
            <p className='text-light break-all'>{companyData.email || ' - '}</p>
          </div>
          <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
            <label className='text-xs text-gray uppercase block w-25'>Phone : </label>
            {editingField === 'phone' ? (
              <div className='flex w-full items-center gap-2'>
                <Input
                  value={draft.phone}
                  onChange={e => updateDraft('phone', e.target.value)}
                  placeholder='Phone'
                  className='bg-bg-3 border-border text-light placeholder:text-gray h-9 flex-1'
                />
                <ActionButtons />
              </div>
            ) : (
              <button
                type='button'
                onClick={() => openFieldEditor('phone')}
                className='text-light text-left hover:text-primary transition-colors'
              >
                {companyData.userable?.phone || ' - '}
              </button>
            )}
          </div>
        </div>
        <div className='grid grid-cols-1 2xl:grid-cols-2 gap-6'>
          <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
            <label className='text-xs text-gray uppercase block w-25'>Status : </label>
            <div className='flex items-center gap-2'>
              <OrganizationStatusSwitch
                checked={companyData.status}
                loading={statusLoading}
                companyId={String(companyData.id)}
                variant='button'
              />
            </div>
          </div>
        </div>

        <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
          <label className='text-xs text-gray uppercase block w-25'>Address : </label>
          {editingField === 'address' ? (
            <div className='flex w-full items-start gap-2'>
              <Textarea
                rows={2}
                value={draft.address}
                onChange={e => updateDraft('address', e.target.value)}
                placeholder='Address'
                className='bg-bg-3 border-border text-light placeholder:text-gray min-h-9 flex-1'
              />
              <ActionButtons />
            </div>
          ) : (
            <button
              type='button'
              onClick={() => openFieldEditor('address')}
              className='text-light text-left hover:text-primary transition-colors'
            >
              {companyData.userable?.address || ' - '}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default GeneralTab
