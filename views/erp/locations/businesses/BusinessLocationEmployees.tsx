'use client'

import React, { useState, useEffect } from 'react'

import { Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import {
  BusinessLocation,
  Column,
  Company,
  CountryWithStates,
  DataTableApiResponse,
  Partner,
  PartnerType,
  Skill
} from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import PartnerService from '@/services/api/partners/partners.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import LocationService from '@/services/api/locations/location.service'
import CompanyService from '@/services/api/companies.service'
import PartnerTypesService from '@/services/api/settings/partner_types.service'
import SkillService from '@/services/api/skills.service'
import CreateOrEditPartnerModal from '@/views/erp/partners/CreateOrEditPartnerModal'
import { formatDateTime } from '@/utils/date'
import { hasPermission } from '@/utils/role-permission'

const BusinessLocationEmployees: React.FC<{ locationId: string }> = ({ locationId }) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>({})
  const [canEditPartner, setCanEditPartner] = useState<boolean>(false)
  const [canDeletePartner, setCanDeletePartner] = useState<boolean>(false)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)

  // Modal data (lazy-loaded)
  const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>([])
  const [countriesWithStatesAndCities, setCountriesWithStatesAndCities] = useState<CountryWithStates[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [partnerTypes, setPartnerTypes] = useState<PartnerType[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [modalDataLoaded, setModalDataLoaded] = useState<boolean>(false)

  useEffect(() => {
    hasPermission('Update Contractor').then(result => setCanEditPartner(result))
    hasPermission('Delete Contractor').then(result => setCanDeletePartner(result))
  }, [])

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterOptions((prev: any) => {
        const newOptions = { ...prev }

        if (searchValue && searchValue.trim() !== '') {
          newOptions.search = searchValue
        } else {
          delete newOptions.search
        }

        if (newOptions.page) {
          delete newOptions.page
        }

        return newOptions
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue])

  const fetchData = async () => {
    setIsLoading(true)

    PartnerService.index({ ...filterOptions, location_id: locationId })
      .then(response => {
        setApiResponse(response.data)
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
        toast.error('Failed to fetch employees')
      })
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions, locationId])

  const fetchModalData = async () => {
    if (modalDataLoaded) return

    try {
      const [businessLocationsRes, locationsRes, companiesRes, partnerTypesRes, skillsRes] = await Promise.allSettled([
        BusinessLocationService.getAll(),
        LocationService.index(),
        CompanyService.getAll(),
        PartnerTypesService.getAll(),
        SkillService.getAll()
      ])

      if (businessLocationsRes.status === 'fulfilled') setBusinessLocations(businessLocationsRes.value.data || [])
      if (locationsRes.status === 'fulfilled') setCountriesWithStatesAndCities(locationsRes.value.data || [])
      if (companiesRes.status === 'fulfilled') setCompanies(companiesRes.value.data || [])
      if (partnerTypesRes.status === 'fulfilled') setPartnerTypes(partnerTypesRes.value.data || [])
      if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value.data || [])

      setModalDataLoaded(true)
    } catch {
      toast.error('Failed to load form data')
    }
  }

  const handleOpenEditModal = async (id: string) => {
    setSelectedPartnerId(id)
    await fetchModalData()

    try {
      const response = await PartnerService.show(id)

      setSelectedPartner(response.data)
      setIsModalOpen(true)
    } catch {
      toast.error('Failed to fetch employee details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedPartnerId(null)
    setSelectedPartner(null)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  const handleDeletePartner = async (id: string) => {
    try {
      await PartnerService.destroy(id)
      toast.success('Employee deleted successfully')
      fetchData()
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete employee')
    }
  }

  const columns: Column[] = [
    {
      id: 'first_name',
      header: 'Full Name',
      cell: (row: Partner) => (
        <span className='font-medium'>
          {row.first_name} {row.last_name || ''}
        </span>
      ),
      sortable: true
    },
    {
      id: 'company',
      header: 'Company',
      cell: (row: Partner) => <span className='font-medium'>{row.userable?.company?.name || '—'}</span>,
      sortable: false
    },
    {
      id: 'email',
      header: 'Email',
      cell: (row: Partner) => <span className='font-medium'>{row.email || '—'}</span>,
      sortable: true
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: (row: Partner) => <span className='font-medium'>{row.userable?.phone || '—'}</span>,
      sortable: false
    },
    {
      id: 'partner_type',
      header: 'Partner Type',
      cell: (row: Partner) => <span className='font-medium'>{row.userable?.partner_type?.name || '—'}</span>,
      sortable: false
    },
    {
      id: 'skills',
      header: 'Skills',
      cell: (row: Partner) => (
        <span className='font-medium'>
          {row.userable?.skills && row.userable.skills.length > 0
            ? row.userable.skills.map((s: Skill) => s.name).join(', ')
            : '—'}
        </span>
      ),
      sortable: false
    },
    {
      id: 'insurance_expiration',
      header: 'Insurance Expiration',
      cell: (row: Partner) => (
        <span className='font-medium'>{formatDateTime(row.userable?.insurance_expiration ?? null)}</span>
      ),
      sortable: false
    },
    {
      id: 'w9_expiration',
      header: 'W9 Expiration',
      cell: (row: Partner) => (
        <span className='font-medium'>{formatDateTime(row.userable?.w9_expiration ?? null)}</span>
      ),
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: Partner) => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditPartner || canDeletePartner) && (
            <ThreeDotButton
              buttons={[
                canEditPartner && (
                  <EditButton
                    tooltip='Edit Employee Information'
                    onClick={() => handleOpenEditModal(row.id)}
                    variant='text'
                  />
                ),
                canDeletePartner && (
                  <DeleteButton tooltip='Delete Employee' variant='text' onClick={() => handleDeletePartner(row.id)} />
                )
              ]}
            />
          )}
        </div>
      ),
      sortable: false,
      headerAlign: 'center',
      size: 30
    }
  ]

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const customFilters = (
    <div className='flex items-center gap-2'>
      <InputGroup>
        <InputGroupInput
          placeholder='Search...'
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          className='w-80'
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
      {hasActiveFilters() && (
        <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light'>
          Clear
        </Button>
      )}
    </div>
  )

  return (
    <>
      <CommonTable
        data={{
          data: (apiResponse?.data as Partner[]) || [],
          per_page: apiResponse?.per_page || 10,
          total: apiResponse?.total || 0,
          from: apiResponse?.from || 1,
          to: apiResponse?.to || 10,
          current_page: apiResponse?.current_page || 1,
          last_page: apiResponse?.last_page || 1
        }}
        columns={columns}
        customFilters={<></>}
        setFilterOptions={setFilterOptions}
        showFilters={true}
        pagination={true}
        isLoading={isLoading}
        emptyMessage='No employees found for this location'
      />

      <CreateOrEditPartnerModal
        mode='edit'
        open={isModalOpen}
        onOpenChange={handleModalClose}
        partnerId={selectedPartnerId || undefined}
        partnerDetails={selectedPartner || undefined}
        businessLocations={businessLocations}
        partnerTypes={partnerTypes}
        countriesWithStatesAndCities={countriesWithStatesAndCities}
        companies={companies}
        skills={skills}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default BusinessLocationEmployees
