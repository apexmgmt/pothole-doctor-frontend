'use client'

import React, { useEffect, useState } from 'react'

import { toast } from 'sonner'

import { Client, CountryWithStates, NoteType } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import ClientService from '@/services/api/clients/clients.service'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentIcon, MessageIcon, UserIcon } from '@/public/icons'
import clsx from 'clsx'
import ClientDetailsContent from './ClientDetailsContent'
import ClientNotes from './notes/ClientNotes'
import ClientDocuments from './documents/ClientDocuments'
import ClientSmsView from './sms/ClientSms'
import ClientEmails from './emails/ClientEmails'
import ClientContacts from './contacts/ClientContacts'
import ClientAddresses from './addresses/ClientAddresses'
import ClientTasks from './tasks/ClientTasks'
import ClientEstimates from './estimates/ClientEstimates'
import ClientInvoices from './invoices/ClientInvoices'
import ClientWorkOrders from './work-orders/ClientWorkOrders'
import { MapPinIcon } from 'lucide-react'

interface ClientDetailsProps {
  type: 'lead' | 'customer'
  clientId: string | null
  canEditClient: boolean
  handleEditClient: () => void
  noteTypes: NoteType[]
  countriesWithStatesAndCities: CountryWithStates[]
}

const ClientDetails: React.FC<ClientDetailsProps> = ({
  type,
  clientId,
  canEditClient,
  handleEditClient,
  noteTypes = [],
  countriesWithStatesAndCities
}) => {
  const [clientData, setClientData] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('notes')

  useEffect(() => {
    if (type === 'lead' && ['tasks', 'estimates', 'invoices', 'work-orders'].includes(activeTab)) {
      setActiveTab('notes')
    }
  }, [type, activeTab])

  const fetchClientDetails = async () => {
    if (!clientId) {
      setClientData(null)

      return
    }

    setIsLoading(true)

    try {
      const response = await ClientService.show(clientId)

      setClientData(response.data)
    } catch (error: any) {
      toast.error(error?.message || `Failed to fetch ${type} details`)
      setClientData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (clientId) {
      fetchClientDetails()
    } else {
      setClientData(null)
    }
  }, [clientId])

  if (!clientId) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray'>No {type} selected</p>
      </div>
    )
  }

  if (isLoading) {
    const skeletonTabs = [
      { id: 'notes' },
      { id: 'documents' },
      { id: 'sms' },
      { id: 'emails' },
      { id: 'contacts' },
      { id: 'addresses' },
      ...(type === 'customer' ? [{ id: 'tasks' }, { id: 'estimates' }, { id: 'invoices' }, { id: 'work-orders' }] : [])
    ]

    return (
      <div className='space-y-5 mt-2.5'>
        {/* Client Details Content Skeleton */}
        <div className='rounded-xl border border-border/50 bg-bg-3'>
          <div className='grid grid-cols-1 lg:grid-cols-2'>
            {/* Left Column */}
            <div className='p-5 space-y-4'>
              <Skeleton className='h-7 w-48' />
              <div className='space-y-3'>
                <Skeleton className='h-4 w-64' />
                <Skeleton className='h-4 w-72' />
                <Skeleton className='h-4 w-60' />
                <Skeleton className='h-4 w-56' />
              </div>
            </div>
            {/* Right Column */}
            <div className='p-5 space-y-4 border-l border-border/50'>
              <Skeleton className='h-7 w-40' />
              <div className='space-y-3'>
                <Skeleton className='h-4 w-56' />
                <Skeleton className='h-4 w-64' />
                <Skeleton className='h-4 w-52' />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className='bg-accent/40 border border-accent/40 rounded-xl p-1 flex items-center gap-2 flex-wrap overflow-x-auto'>
          {skeletonTabs.map(tab => (
            <Skeleton key={tab.id} className='h-10 w-28 rounded-lg shrink-0' />
          ))}
        </div>

        {/* Tab Content Skeleton */}
        <div className='space-y-4 rounded-lg border border-border/50 bg-bg-3 p-5'>
          <div className='space-y-3'>
            <Skeleton className='h-6 w-40' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-5/6' />
          </div>
          <div className='pt-4 space-y-3'>
            <Skeleton className='h-10 w-full rounded-lg' />
            <Skeleton className='h-10 w-full rounded-lg' />
            <Skeleton className='h-10 w-3/4 rounded-lg' />
          </div>
        </div>
      </div>
    )
  }

  if (!clientData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray'>{type === 'lead' ? 'Lead' : 'Customer'} not found</p>
      </div>
    )
  }

  const tabs = [
    {
      id: 'notes',
      label: 'Notes',
      icon: DocumentIcon
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: DocumentIcon
    },
    {
      id: 'sms',
      label: 'SMS',
      icon: MessageIcon
    },
    {
      id: 'emails',
      label: 'Emails',
      icon: MessageIcon
    },

    {
      id: 'contacts',
      label: 'Contacts',
      icon: UserIcon
    },
    {
      id: 'addresses',
      label: 'Addresses',
      icon: MapPinIcon
    },
    ...(type === 'customer'
      ? [
          {
            id: 'tasks',
            label: 'Tasks',
            icon: DocumentIcon
          },
          {
            id: 'estimates',
            label: 'Estimates',
            icon: DocumentIcon
          },
          {
            id: 'invoices',
            label: 'Invoices',
            icon: DocumentIcon
          },
          {
            id: 'work-orders',
            label: 'Work Orders',
            icon: DocumentIcon
          }
        ]
      : [])
  ]

  return (
    <div className=''>
      <ClientDetailsContent clientData={clientData} canEditClient={canEditClient} handleEditClient={handleEditClient} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className='my-4'>
        <TabsList className='h-auto w-full justify-start overflow-x-auto bg-accent/40 border-accent/40 rounded-xl p-1'>
          {tabs.map(tab => {
            const Icon = tab.icon

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={clsx(
                  'h-10 gap-2 whitespace-nowrap rounded-lg border border-transparent px-3 text-accent-foreground/50 data-[state=active]:border-accent data-[state=active]:bg-accent/90 data-[state=active]:text-accent-foreground'
                )}
              >
                <Icon className='h-4 w-4' />
                <span>{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {activeTab === 'documents' && clientId && <ClientDocuments clientId={clientId} />}
      {activeTab === 'sms' && clientId && <ClientSmsView clientId={clientId} client={clientData} />}
      {activeTab === 'emails' && clientId && <ClientEmails clientId={clientId} client={clientData} />}
      {activeTab === 'notes' && clientId && <ClientNotes clientId={clientId} noteTypes={noteTypes} />}
      {activeTab === 'contacts' && clientId && (
        <ClientContacts clientId={clientId} countriesWithStatesAndCities={countriesWithStatesAndCities} />
      )}
      {activeTab === 'addresses' && clientId && (
        <ClientAddresses clientId={clientId} countriesWithStatesAndCities={countriesWithStatesAndCities} />
      )}
      {activeTab === 'tasks' && clientId && type === 'customer' && <ClientTasks clientId={clientId} />}
      {activeTab === 'estimates' && clientId && type === 'customer' && <ClientEstimates clientId={clientId} />}
      {activeTab === 'invoices' && clientId && type === 'customer' && <ClientInvoices clientId={clientId} />}
      {activeTab === 'work-orders' && clientId && type === 'customer' && <ClientWorkOrders clientId={clientId} />}
    </div>
  )
}

export default ClientDetails
