'use client'

import React, { useEffect, useState } from 'react'

import { toast } from 'sonner'

import VendorService from '@/services/api/vendors/vendors.service'
import VendorDetailsContent from './VendorDetailsContent'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { Vendor, CountryWithStates } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { DocumentIcon, UserIcon } from '@/public/icons'
import clsx from 'clsx'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import VendorDocuments from './documents/VendorDocuments'
import VendorRebateCredits from './rebate-credits/VendorRebateCredits'
import VendorPickupAddresses from './pickup-addresses/VendorPickupAddresses'
import VendorSalesmen from './salesman/VendorSalesmen'

interface VendorDetailsProps {
  vendorId: string
  onEdit?: (vendor: Vendor) => void
  countriesWithStatesAndCities: CountryWithStates[]
}

const VendorDetails: React.FC<VendorDetailsProps> = ({ vendorId, onEdit, countriesWithStatesAndCities }) => {
  const [vendorData, setVendorData] = useState<Vendor | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>('salesman')

  const fetchVendorDetails = async () => {
    setIsLoading(true)

    try {
      const response = await VendorService.show(vendorId)

      setVendorData(response.data)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch vendor details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (vendorId) {
      fetchVendorDetails()
    }
  }, [vendorId])

  if (isLoading) {
    const skeletonTabs = [
      { id: 'salesman' },
      { id: 'documents' },
      { id: 'rebate-credits' },
      { id: 'pickup-addresses' }
    ]

    return (
      <div className='space-y-6 mt-2.5'>
        {/* Header */}
        <div className='flex items-center justify-between pt-4'>
          <Skeleton className='h-8 w-48' />
        </div>

        {/* Vendor Details Content Skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Left Column (Contact Info) */}
          <div className='space-y-4 bg-bg-3 p-5 rounded-lg'>
            <Skeleton className='h-6 w-32' />
            <div className='space-y-3'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-5/6' />
              <Skeleton className='h-4 w-4/5' />
              <Skeleton className='h-4 w-11/12' />
            </div>
          </div>
          {/* Right Column (Business Info) */}
          <div className='space-y-4 bg-bg-3 p-5 rounded-lg'>
            <Skeleton className='h-6 w-32' />
            <div className='space-y-3'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-5/6' />
              <Skeleton className='h-4 w-4/5' />
              <Skeleton className='h-4 w-11/12' />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className='bg-accent/40 border border-accent/40 rounded-xl p-1 flex items-center gap-2 flex-wrap overflow-x-auto'>
          {skeletonTabs.map(tab => (
            <Skeleton key={tab.id} className='h-8 w-28 rounded-lg shrink-0' />
          ))}
        </div>

        {/* Tab Content Skeleton */}
        <div className='space-y-4 bg-bg-3 p-5 rounded-lg'>
          <Skeleton className='h-6 w-40' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-3/4' />
          </div>
        </div>
      </div>
    )
  }

  if (!vendorData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray'>No vendor selected</p>
      </div>
    )
  }

  const tabs = [
    {
      id: 'salesman',
      label: 'Salesmen',
      icon: UserIcon
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: DocumentIcon
    },
    {
      id: 'rebate-credits',
      label: 'Rebate & Credits',
      icon: DocumentIcon
    },
    {
      id: 'pickup-addresses',
      label: 'Pickup Addresses',
      icon: DocumentIcon
    }
  ]

  return (
    <div>
      <VendorDetailsContent vendorData={vendorData} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='my-4'>
        <TabsList className='h-auto w-full justify-start overflow-x-auto bg-accent/40 border-accent/40 rounded-xl p-1'>
          {tabs.map(tab => {
            const Icon = tab.icon

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={clsx(
                  'h-8 gap-2 whitespace-nowrap rounded-lg border border-transparent px-3 py-2.5 text-xs text-accent-foreground/50 data-[state=active]:border-accent data-[state=active]:bg-accent/90 data-[state=active]:text-accent-foreground'
                )}
              >
                <Icon className='h-4 w-4' />
                <span>{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {activeTab === 'salesman' && vendorData.userable_id && <VendorSalesmen vendorId={vendorData.userable_id} />}
      {activeTab === 'documents' && vendorData.userable_id && <VendorDocuments vendorId={vendorData.userable_id} />}
      {activeTab === 'rebate-credits' && vendorData.userable_id && (
        <VendorRebateCredits vendorId={vendorData.userable_id} />
      )}
      {activeTab === 'pickup-addresses' && vendorData.userable_id && (
        <VendorPickupAddresses
          countriesWithStatesAndCities={countriesWithStatesAndCities}
          vendorId={vendorData.userable_id}
        />
      )}
    </div>
  )
}

export default VendorDetails
