import { useEffect, useState } from 'react'

import Image from 'next/image'

import Link from 'next/link'

import { id, se } from 'date-fns/locale'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import EditButton from '@/components/erp/common/buttons/EditButton'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { DocumentIcon } from '@/public/icons'
import PartnerDocumentService from '@/services/api/partners/partner-documents.service'
import { Column, DataTableApiResponse, Document } from '@/types'
import { generateFileUrl, getFileType } from '@/utils/utility'

import CreateOrEditDocumentModal from './CreateOrEditDocumentModal'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'

const PartnerDocuments = ({ userId }: { userId: string }) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [filterOptions, setFilterOptions] = useState<any>({ page: 1, per_page: 10, searchable_id: userId })

  // Set initial search value from filterOptions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')
  }, [])

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterOptions((prev: any) => {
        // Remove search if empty, otherwise set it
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

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true)

    try {
      PartnerDocumentService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error('Error fetching documents')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Error fetching documents')
    }
  }

  // Fetch data when filterOptions change
  useEffect(() => {
    fetchData()
  }, [filterOptions])

  // Transform API data to match table format
  const documentData = apiResponse?.data
    ? apiResponse.data.map((document: Document, index: number) => {
        return {
          id: document.id,
          documentable_id: document.documentable_id,
          index: (apiResponse?.from || 1) + index,
          documentable_type: document.documentable_type,
          name: document.name,
          full_path: generateFileUrl(document.full_path),
          created_at: document.created_at,
          updated_at: document.updated_at
        }
      })
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

    // Fetch contact type details
    try {
      const response = await PartnerDocumentService.show(id)

      setSelectedDocument(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch document details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedDocumentId(null)
    setSelectedDocument(null)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  // Column definitions for CommonTable
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
            <Link href={row.full_path} target='_blank' rel='noopener noreferrer' className='font-medium'>
              <Image src={row.full_path} unoptimized alt={row.name} width={100} height={100} className='rounded-md' />
            </Link>
          ) : getFileType(row.full_path) === 'video' ? (
            <Link href={row.full_path} target='_blank' rel='noopener noreferrer' className='font-medium'>
              <video width={100} height={50} controls className='rounded-md'>
                <source src={row.full_path} type='video/mp4' />
                Your browser does not support the video tag.
              </video>
            </Link>
          ) : (
            <Link
              href={row.full_path}
              target='_blank'
              rel='noopener noreferrer'
              className='font-medium flex items-center'
            >
              <DocumentIcon className='w-10 h-10' />{' '}
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

  const handleClearFilters = () => {
    setFilterOptions({ searchable_id: userId, page: 1, per_page: 10 })
    setSearchValue('')
  }

  const handleDeleteDocument = async (id: string) => {
    try {
      PartnerDocumentService.destroy(id)
        .then(response => {
          toast.success('Document deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete document')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the document!')
    }
  }

  // Check if filters are active (excluding pagination)
  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  // Custom filters component
  const customFilters = (
    <div className='flex items-center justify-between w-full'>
      <div className='flex items-center gap-2'>
        {/* <InputGroup>
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
        )} */}
      </div>
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
        emptyMessage='No document found'
      />

      <CreateOrEditDocumentModal
        userId={userId}
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        documentId={selectedDocumentId || undefined}
        documentDetails={selectedDocument || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default PartnerDocuments
