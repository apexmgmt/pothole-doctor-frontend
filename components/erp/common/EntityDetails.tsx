'use client'

import React, { useState, ReactNode } from 'react'
import { PhoneIcon, PlusIcon } from 'lucide-react'
import CustomButton from './CustomButton'
import CustomTable from './CustomTable'
import DocumentsGallery from './DocumentsGallery'
import {
  CallIcon,
  DocumentIcon,
  DoubleQuoteIcon,
  LocationIcon,
  SalesRepIcon,
  MeasurementsIcon,
  MessageIcon,
  CalendarIcon,
  UserIcon
} from '@/public/icons'

type EntityType = 'lead' | 'customer' | string

interface EntityData {
  id?: string | number
  name?: string
  email?: string
  phone?: string
  jobAddress?: string
  address?: string
  createdDate?: string
  createdBy?: string
  salesRep?: string
  [key: string]: any
}

interface TabColumn {
  key: string
  label: string
  sortable?: boolean
  whitespace?: string
}

interface TabActionButton {
  label: string
  action: string
  variant: string
  icon: React.ComponentType<any> | ReactNode
}

interface TabConfig {
  id: string
  label: string
  icon: React.ComponentType<any>
  data: any[]
  columns: TabColumn[]
  actionButtons: TabActionButton[]
}

interface EntityDetailsProps {
  entityData: EntityData
  entityType?: EntityType
  onEdit?: () => void
  customTabs?: TabConfig[] | null
}

const EntityDetails: React.FC<EntityDetailsProps> = ({
  entityData,
  entityType = 'lead',
  onEdit,
  customTabs = null
}) => {
  const [activeTab, setActiveTab] = useState<string>('email')

  // Default tab configuration - can be overridden by customTabs
  const defaultTabs: TabConfig[] = [
    {
      id: 'email',
      label: 'Email',
      icon: UserIcon,
      data: [
        {
          id: 1,
          sentBy: entityData?.name || 'Liam Harper',
          source: entityData?.email || 'service@potholedoctors.com',
          subject: 'Road repair',
          dateSent: '12-07-2025'
        }
      ],
      columns: [
        { key: 'checkbox', label: '' },
        { key: 'sentBy', label: 'Sent By', sortable: true },
        { key: 'source', label: 'Source', sortable: true },
        { key: 'subject', label: 'Subject', sortable: true },
        { key: 'dateSent', label: 'Date Sent', sortable: true }
      ],
      actionButtons: [
        {
          label: 'Compose & Send Email',
          action: 'compose_email',
          variant: 'primary',
          icon: PlusIcon
        }
      ]
    },
    {
      id: 'sms',
      label: 'SMS',
      icon: MessageIcon,
      data: [
        {
          id: 1,
          sentBy: entityData?.name || 'Liam Harper',
          source: entityData?.phone || '(740) 330-5155',
          subject: 'Project update',
          dateSent: '12-07-2025'
        }
      ],
      columns: [
        { key: 'checkbox', label: '' },
        { key: 'sentBy', label: 'Sent By', sortable: true },
        { key: 'source', label: 'Source', sortable: true },
        { key: 'subject', label: 'Subject', sortable: true },
        { key: 'dateSent', label: 'Date Sent', sortable: true }
      ],
      actionButtons: [
        {
          label: 'Send SMS',
          action: 'send_sms',
          variant: 'primary',
          icon: PlusIcon
        }
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: DocumentIcon,
      data: [
        {
          id: 1,
          name: `Estimate_${entityData?.id || '001545464'}.pdf`,
          type: 'Estimate',
          uploadedBy: entityData?.name || 'Liam Harper',
          dateUploaded: '12-07-2025'
        }
      ],
      columns: [
        { key: 'checkbox', label: '' },
        { key: 'name', label: 'Document Name', sortable: true },
        { key: 'type', label: 'Type', sortable: true },
        { key: 'uploadedBy', label: 'Uploaded By', sortable: true },
        { key: 'dateUploaded', label: 'Date Uploaded', sortable: true }
      ],
      actionButtons: [
        {
          label: 'Upload Document',
          action: 'upload_document',
          variant: 'primary',
          icon: PlusIcon
        }
      ]
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: UserIcon,
      data: [
        {
          id: 1,
          name: entityData?.name || 'Liam Harper',
          phone: entityData?.phone || '(740) 330-5155',
          email: entityData?.email || 'service@potholedoctors.com',
          role: 'Primary Contact'
        }
      ],
      columns: [
        { key: 'checkbox', label: '' },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'phone', label: 'Phone', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'role', label: 'Role', sortable: true }
      ],
      actionButtons: [
        {
          label: 'Add Contact',
          action: 'add_contact',
          variant: 'primary',
          icon: PlusIcon
        }
      ]
    },
    {
      id: 'addresses',
      label: 'Addresses',
      icon: LocationIcon,
      data: [
        {
          id: 1,
          address: entityData?.jobAddress || '708-D Fairground Rd, Lucasville, OH 45648',
          type: 'Job Site',
          isPrimary: true
        }
      ],
      columns: [
        { key: 'checkbox', label: '' },
        {
          key: 'address',
          label: 'Address',
          sortable: true,
          whitespace: 'normal'
        },
        { key: 'type', label: 'Type', sortable: true },
        { key: 'isPrimary', label: 'Primary', sortable: true }
      ],
      actionButtons: [
        {
          label: 'Add Address',
          action: 'add_address',
          variant: 'primary',
          icon: PlusIcon
        }
      ]
    },
    {
      id: 'measurements',
      label: 'Measurements',
      icon: MeasurementsIcon,
      data: [
        {
          id: 1,
          area: 'Parking Lot',
          length: '50 ft',
          width: '30 ft',
          totalArea: '1500 sq ft',
          dateMeasured: '12-07-2025'
        }
      ],
      columns: [
        { key: 'checkbox', label: '' },
        { key: 'area', label: 'Area', sortable: true },
        { key: 'length', label: 'Length', sortable: true },
        { key: 'width', label: 'Width', sortable: true },
        { key: 'totalArea', label: 'Total Area', sortable: true },
        { key: 'dateMeasured', label: 'Date Measured', sortable: true }
      ],
      actionButtons: [
        {
          label: 'Add Measurement',
          action: 'add_measurement',
          variant: 'primary',
          icon: PlusIcon
        }
      ]
    },
    {
      id: 'estimate',
      label: 'Estimate',
      icon: DoubleQuoteIcon,
      data: [
        {
          id: 1,
          estimateNumber: `EST-${entityData?.id || '001545464'}`,
          amount: '$2,500.00',
          status: 'Pending',
          createdDate: '12-07-2025',
          validUntil: '12-21-2025'
        }
      ],
      columns: [
        { key: 'checkbox', label: '' },
        { key: 'estimateNumber', label: 'Estimate #', sortable: true },
        { key: 'amount', label: 'Amount', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'createdDate', label: 'Created Date', sortable: true },
        { key: 'validUntil', label: 'Valid Until', sortable: true }
      ],
      actionButtons: [
        {
          label: 'Create Estimate',
          action: 'create_estimate',
          variant: 'primary',
          icon: PlusIcon
        }
      ]
    }
  ]

  // Use custom tabs if provided, otherwise use default tabs
  const tabs = customTabs || defaultTabs
  const activeTabData = tabs.find(tab => tab.id === activeTab)

  const handleActionButtonClick = (action: string) => {
    console.log(`${entityType} action clicked:`, action)
    // Handle different actions based on the tab and entity type
  }

  const handleRowClick = (row: any) => {
    console.log(`${entityType} row clicked:`, row)
  }

  const handleRowSelectionChange = (selectedIds: any[]) => {
    console.log(`${entityType} selected rows:`, selectedIds)
  }

  const handleExport = (format: string, data: any) => {
    console.log(`Exporting ${format} for ${entityType}:`, data)
  }

  // Get entity-specific information fields based on the second image layout
  const getEntityInfo = () => {
    const baseInfo = [
      {
        icon: CalendarIcon,
        label: 'Date Added:',
        value: `${entityData?.createdDate || '12-07-2025'} by ${entityData?.createdBy || 'David Warner'}`
      },
      {
        icon: UserIcon,
        label: 'Contact Type:',
        value: entityType === 'customer' ? 'Customer' : 'Lead'
      },
      {
        icon: CallIcon,
        label: 'Phone:',
        value: entityData?.phone || '(740) 330-5155'
      },
      {
        icon: MessageIcon,
        label: 'Email:',
        value: entityData?.email || 'service@potholedoctors.com'
      },
      {
        icon: LocationIcon,
        label: 'Address:',
        value: entityData?.jobAddress || entityData?.address || '708-D Fairground Rd, Lucasville, OH 45648'
      }
    ]

    return baseInfo
  }

  // Get additional information for the right side
  const getAdditionalInfo = () => {
    return [
      {
        icon: LocationIcon,
        label: 'Address:',
        value: entityData?.jobAddress || entityData?.address || '708-D Fairground Rd, Lucasville, OH 45648'
      },
      {
        icon: SalesRepIcon,
        label: 'Sales Rep:',
        value: entityData?.salesRep || entityData?.name || 'Liam Harper'
      },
      {
        icon: CalendarIcon,
        label: 'Started On:',
        value: entityData?.createdDate || '12-07-2025'
      }
    ]
  }

  return (
    <div className='space-y-6'>
      {/* Entity Information Header - Two Column Layout */}
      <div className='pt-6'>
        {/* Two Column Information Layout with Divider */}
        <div className='flex gap-8'>
          {/* Left Column - Main Contact Information */}
          <div className='flex-1 space-y-4'>
            <div className='flex items-start justify-between mb-6'>
              <div className='flex items-start gap-4'>
                {/* Profile Picture */}
                <div className='w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center'>
                  <span className='text-2xl font-semibold text-primary'>{entityData?.name?.charAt(0) || 'P'}</span>
                </div>

                {/* Entity Details */}
                <div className='space-y-2'>
                  <h3 className='text-xl font-semibold text-light'>{entityData?.name || 'Pothole Doctors'}</h3>
                  <p className='text-gray'>{entityData?.email || 'todd@potholedoctors.com'}</p>
                </div>
              </div>

              {/* Edit Button */}
              <CustomButton variant='outline' size='sm' onClick={onEdit}>
                Edit
              </CustomButton>
            </div>

            {getEntityInfo().map((info, index) => (
              <div key={index} className='flex items-center gap-3'>
                <div className='w-5 h-5 flex items-center justify-center text-gray'>
                  <info.icon />
                </div>
                <div className='flex-1'>
                  <span className='text-sm text-gray'>{info.label}</span>
                  <span className='text-sm text-light ml-2'>{info.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Vertical Divider */}
          <div className='w-px bg-border'></div>

          {/* Right Column - Additional Information */}
          <div className='flex-1 space-y-4'>
            <h4 className='text-lg font-semibold text-light mb-4'>Information</h4>
            {getAdditionalInfo().map((info, index) => (
              <div key={index} className='flex items-center gap-3'>
                <div className='w-5 h-5 rounded-lg flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 text-gray'>
                  <info.icon />
                </div>
                <div className='flex-1'>
                  <span className='text-sm text-gray'>{info.label}</span>
                  <span className='text-sm text-light ml-2'>{info.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className=''>
        <div className='flex flex-wrap gap-2 p-1 bg-border/40 rounded-lg'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-border/40 text-light border-border'
                  : 'text-gray border-transparent hover:text-light hover:bg-bg/20'
              }`}
            >
              <span>
                <tab.icon />
              </span>
              <span className='text-xs font-medium'>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className=''>
          {activeTab === 'documents' ? (
            <DocumentsGallery
              entityData={entityData}
              onUpload={() => handleActionButtonClick('upload_document')}
              onDownload={(doc: any) => console.log('Download:', doc)}
              onDelete={(doc: any) => console.log('Delete:', doc)}
            />
          ) : (
            <CustomTable
              data={activeTabData?.data || []}
              columns={activeTabData?.columns || []}
              actionButtons={activeTabData?.actionButtons || []}
              onActionButtonClick={handleActionButtonClick}
              onRowClick={handleRowClick}
              onRowSelectionChange={handleRowSelectionChange}
              onExport={handleExport}
              showExport={true}
              showFilter={false}
              searchPlaceholder='Search...'
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default EntityDetails
