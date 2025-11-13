'use client'

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { appUrl } from '@/utils/utility'
import CompanyStatusSwitch from './CompanyStatusSwitch'
import CompanyService from '@/services/api/company.service'
import EditButton from '@/components/erp/common/buttons/EditButton'

interface CompanyDetailsProps {
  companyData: any
  setCompanyData: (options: any) => void
  fetchData?: () => void
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ companyData, setCompanyData, fetchData }) => {
  const fetchCompanyDetails = async () => {
    CompanyService.show(companyData?.id)
      .then(response => {
        setCompanyData(response.data)
        if (fetchData) {
          fetchData()
        }
      })
      .catch(error => {
        console.error('Error fetching company details:', error)
      })
  }

  if (!companyData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray'>No company selected</p>
      </div>
    )
  }

  const fullName = `${companyData.first_name || ''} ${companyData.last_name || ''}`.trim()
  const initials = fullName
    .split(' ')
    .map((name: string) => name.charAt(0))
    .join('')
    .toUpperCase()

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-semibold text-light mt-2'>Company Details</h3>
        <div className='mt-2'>
          <EditButton
            title='Edit'
            tooltip='Edit Company Information'
            link={`/erp/companies/${companyData.id}/edit`}
            variant='text'
            buttonSize='default'
            buttonVariant='outline'
          />
        </div>
      </div>

      {/* Profile Section */}
      <div className='flex items-center space-x-4 p-4 bg-bg-3 rounded-lg'>
        <Avatar className='h-16 w-16'>
          <AvatarImage src={companyData.userable?.profile_picture} alt={fullName} />
          <AvatarFallback className='text-lg font-semibold'>{initials || 'C'}</AvatarFallback>
        </Avatar>
        <div className='space-y-1'>
          <h4 className='text-lg font-medium text-light'>{fullName}</h4>
          <p className='text-gray'>{companyData.email}</p>
          <Badge variant={companyData.status ? 'default' : 'destructive'}>
            {companyData.status ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Details Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Personal Information */}
        <div className='space-y-4'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Personal Information</h5>
          <div className='space-y-3'>
            <div>
              <label className='text-xs text-gray uppercase'>First Name</label>
              <p className='text-light'>{companyData.first_name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Last Name</label>
              <p className='text-light'>{companyData.last_name || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Email</label>
              <p className='text-light'>{companyData.email || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Phone</label>
              <p className='text-light'>{companyData.userable?.phone || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Address</label>
              <p className='text-light'>{companyData.userable?.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className='space-y-4'>
          <h5 className='text-sm font-medium text-light uppercase tracking-wide'>Company Information</h5>
          <div className='space-y-3'>
            <div>
              <label className='text-xs text-gray uppercase'>Domain</label>
              <p className='text-light'>{appUrl(companyData.domain?.domain) || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Guard</label>
              <p className='text-light'>{companyData.guard || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs text-gray uppercase'>Tenant ID</label>
              <p className='text-light text-xs break-all'>{companyData.tenant_id || 'N/A'}</p>
            </div>
            <div className='flex items-center gap-2'>
              <label className='text-xs text-gray uppercase'>Status</label>
              <CompanyStatusSwitch
                checked={!!companyData.status}
                companyId={companyData.id}
                fetchData={fetchCompanyDetails}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className='pt-4 border-t border-border'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-gray uppercase'>Created At</label>
            <p className='text-light text-sm'>
              {companyData.created_at ? new Date(companyData.created_at).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className='text-xs text-gray uppercase'>Updated At</label>
            <p className='text-light text-sm'>
              {companyData.updated_at ? new Date(companyData.updated_at).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyDetails
