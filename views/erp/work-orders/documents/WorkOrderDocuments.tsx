import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import EditButton from '@/components/erp/common/buttons/EditButton'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { DocumentIcon } from '@/public/icons'
import { Column, DataTableApiResponse, Document } from '@/types'
import { generateFileUrl, getFileType } from '@/utils/utility'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import WorkOrderDocumentService from '@/services/api/work-orders/work-order-documents.service'
import CreateOrEditWorkOrderDocumentModal from './CreateOrEditWorkOrderDocumentModal'

const WorkOrderDocuments = ({ workOrderId }: { workOrderId: string }) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [filterOptions, setFilterOptions] = useState<any>({ page: 1, per_page: 10, searchable_id: workOrderId })

  const fetchData = async () => {
    setIsLoading(true)

    try {
      WorkOrderDocumentService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
          toast.error('Error fetching documents')
        })
    } catch {
      setIsLoading(false)
      toast.error('Error fetching documents')
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions])

  const documentData = apiResponse?.data
    ? apiResponse.data.map((document: Document, index: number) => ({
        id: document.id,
        documentable_id: document.documentable_id,
        index: (apiResponse?.from || 1) + index,
        documentable_type: document.documentable_type,
        name: document.name,
        full_path: generateFileUrl(document.full_path),
        created_at: document.created_at,
        updated_at: document.updated_at
      }))
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedDocumentId(null)
    setSelectedDocument(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedDocumentId(id)

    try {
      const response = await WorkOrderDocumentService.show(id)

      setSelectedDocument(response.data)
      setIsModalOpen(true)
    } catch {
      toast.error('Failed to fetch document details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedDocumentId(null)
    setSelectedDocument(null)
  }

  const handleDeleteDocument = async (id: string) => {
    try {
      await WorkOrderDocumentService.destroy(id)
        .then(() => {
          toast.success('Document deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete document')
        })
    } catch {
      toast.error('Something went wrong while deleting the document!')
    }
  }

  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: row => <span className='text-gray'>{row.index}</span>,
      sortable: false,
      size: 16
    },
    {
      id: 'name',
      header: 'File Name',
      cell: row => <span className='font-medium'>{row.name}</span>,
      sortable: true
    },
    {
      id: 'full_path',
      header: 'File',
      cell: row => (
        <>
          {getFileType(row.full_path) === 'image' ? (
            <Link href={row.full_path} target='_blank' rel='noopener noreferrer'>
              <Image src={row.full_path} alt={row.name} width={100} height={100} unoptimized className='rounded-md' />
            </Link>
          ) : getFileType(row.full_path) === 'video' ? (
            <Link href={row.full_path} target='_blank' rel='noopener noreferrer'>
              <video width={100} height={50} controls className='rounded-md'>
                <source src={row.full_path} type='video/mp4' />
                Your browser does not support the video tag.
              </video>
            </Link>
          ) : (
            <Link href={row.full_path} target='_blank' rel='noopener noreferrer' className='flex items-center'>
              <DocumentIcon className='w-10 h-10' />
            </Link>
          )}
        </>
      ),
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <ThreeDotButton
          buttons={[
            <EditButton tooltip='Edit Document' onClick={() => handleOpenEditModal(row.id)} variant='text' />,
            <DeleteButton tooltip='Delete Document' variant='text' onClick={() => handleDeleteDocument(row.id)} />
          ]}
        />
      ),
      sortable: false,
      headerAlign: 'center',
      size: 30
    }
  ]

  const customFilters = (
    <div className='flex items-center justify-end w-full'>
      <Button
        variant='default'
        size='sm'
        className='bg-light text-bg hover:bg-light/90'
        onClick={handleOpenCreateModal}
      >
        <PlusIcon className='w-4 h-4' />
        Add Document
      </Button>
    </div>
  )

  return (
    <>
      <CommonTable
        data={{
          data: documentData,
          per_page: apiResponse?.per_page || 10,
          total: apiResponse?.total || 0,
          from: apiResponse?.from || 1,
          to: apiResponse?.to || 10,
          current_page: apiResponse?.current_page || 1,
          last_page: apiResponse?.last_page || 1
        }}
        columns={columns}
        customFilters={customFilters}
        setFilterOptions={setFilterOptions}
        showFilters={true}
        pagination={true}
        isLoading={isLoading}
        emptyMessage='No documents found'
      />

      <CreateOrEditWorkOrderDocumentModal
        workOrderId={workOrderId}
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        documentId={selectedDocumentId || undefined}
        documentDetails={selectedDocument || undefined}
        onSuccess={() => {
          fetchData()
          handleModalClose()
        }}
      />
    </>
  )
}

export default WorkOrderDocuments
