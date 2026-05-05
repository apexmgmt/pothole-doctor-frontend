'use client'

import { useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import { toast } from 'sonner'

import { BusinessLocation, Client, EstimateType, PaymentTerm, ServiceType, Staff } from '@/types'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import ClientService from '@/services/api/clients/clients.service'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import StaffService from '@/services/api/staff.service'
import CreateOrEditInvoiceModal from '@/views/erp/invoices/CreateOrEditInvoiceModal'
import ReusableInvoiceTable from '@/views/erp/invoices/ReusableInvoiceTable'

const ClientInvoices = ({ clientId }: { clientId: string }) => {
  const router = useRouter()

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [refreshKey, setRefreshKey] = useState<number>(0)

  // Modal form data — loaded once on first use
  const modalDataLoaded = useRef(false)
  const [invoiceTypes, setInvoiceTypes] = useState<EstimateType[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [staffs, setStaffs] = useState<Staff[]>([])
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([])
  const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>([])

  const loadModalData = async () => {
    if (modalDataLoaded.current) return

    try {
      const [invoiceTypesRes, serviceTypesRes, clientsRes, staffsRes, paymentTermsRes, businessLocationsRes] =
        await Promise.allSettled([
          EstimateTypeService.getAll(),
          ServiceTypeService.getAll(),
          ClientService.getAll('customer'),
          StaffService.getAll(),
          PaymentTermsService.getAllPaymentTerms(),
          BusinessLocationService.getAll()
        ])

      if (invoiceTypesRes.status === 'fulfilled') setInvoiceTypes(invoiceTypesRes.value.data || [])
      if (serviceTypesRes.status === 'fulfilled') setServiceTypes(serviceTypesRes.value.data || [])
      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value.data || [])
      if (staffsRes.status === 'fulfilled') setStaffs(staffsRes.value.data || [])
      if (paymentTermsRes.status === 'fulfilled') setPaymentTerms(paymentTermsRes.value.data || [])
      if (businessLocationsRes.status === 'fulfilled') setBusinessLocations(businessLocationsRes.value.data || [])

      modalDataLoaded.current = true
    } catch {
      toast.error('Failed to load invoice form data')
    }
  }

  const handleOpenCreateModal = async () => {
    await loadModalData()
    setIsModalOpen(true)
  }

  return (
    <>
      <ReusableInvoiceTable
        fixedFilters={{ client_id: clientId }}
        hiddenColumnIds={['client']}
        showCreateButton={true}
        onCreateInvoice={handleOpenCreateModal}
        createButtonLabel='Add Invoice'
        refreshKey={refreshKey}
        emptyMessage='No invoices found'
      />

      <CreateOrEditInvoiceModal
        mode='create'
        open={isModalOpen}
        onOpenChange={open => setIsModalOpen(open)}
        onCreateSuccess={invoice => {
          router.push(`/erp/invoices/${invoice.id}`)
        }}
        invoiceTypes={invoiceTypes}
        serviceTypes={serviceTypes}
        clients={clients}
        staffs={staffs}
        paymentTerms={paymentTerms}
        businessLocations={businessLocations}
        defaultClientId={clientId}
        onSuccess={() => {
          setRefreshKey(prev => prev + 1)
          setIsModalOpen(false)
        }}
      />
    </>
  )
}

export default ClientInvoices
