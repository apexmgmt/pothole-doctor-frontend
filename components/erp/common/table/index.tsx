'use client'

import React, { useMemo, ReactNode, useState } from 'react'
import { SpinnerCustom } from '@/components/ui/spinner'
import Pagination from './Pagination'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Column } from '@/types'

interface CommonTableProps {
  data?: {
    data: any[]
    per_page: number
    total: number
    from: number
    to: number
    current_page: number
    last_page: number
  }
  columns: Column[]
  customFilters?: ReactNode
  isLoading?: boolean
  setFilterOptions?: (options: any) => void
  showFilters?: boolean
  pagination?: boolean
  className?: string
  emptyMessage?: string
  handleRowSelect?: (row: any) => void
  rowKey?: string
}

const CommonTable: React.FC<CommonTableProps> = ({
  data,
  columns = [],
  customFilters,
  isLoading = false,
  setFilterOptions,
  showFilters = true,
  pagination = true,
  className = '',
  emptyMessage = 'No data available',
  handleRowSelect,
  rowKey = 'id'
}) => {
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(null)
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  // Derive all values directly from props
  const tableData = data?.data || []
  const total = data?.total || 0
  const from = data?.from || 1
  const to = data?.to || 10
  const currentPage = data?.current_page || 1
  const perPage = data?.per_page || 10
  const lastPage = data?.last_page || 1

  // Calculate total pages
  const totalPages = useMemo(() => lastPage, [lastPage])

  // Handle row click
  const handleRowClick = (row: any) => {
    const rowId = row[rowKey]
    setSelectedRowId(rowId)

    if (handleRowSelect) {
      handleRowSelect(row)
    }
  }

  // Handle page size change
  const updatePageSize = (value: number) => {
    if (setFilterOptions) {
      setFilterOptions((prevOptions: any) => {
        const newOptions = { ...prevOptions, per_page: value, page: 1 }
        if (newOptions.per_page === 10) delete newOptions.per_page
        if (newOptions.page === 1) delete newOptions.page
        return newOptions
      })
    }
  }

  // Handle page change
  const updatePageNumber = (value: number) => {
    if (setFilterOptions) {
      setFilterOptions((prevOptions: any) => {
        const newOptions = { ...prevOptions, per_page: perPage, page: value }
        if (newOptions.per_page === 10) delete newOptions.per_page
        if (newOptions.page === 1) delete newOptions.page
        return newOptions
      })
    }
  }

  // Handle sorting
  const handleSorting = (columnId: string, canSort: boolean) => {
    if (!canSort || !setFilterOptions) return
    let sortBy: string | null = null
    let sortOrder: 'asc' | 'desc' | null = null

    setFilterOptions((prevOptions: any) => {
      const newOptions = { ...prevOptions }
      const currentSortBy = prevOptions.sortBy
      const currentSortOrder = prevOptions.sortOrder

      if (currentSortBy === columnId) {
        const newDirection =
          currentSortOrder === null || currentSortOrder === undefined
            ? 'asc'
            : currentSortOrder === 'asc'
              ? 'desc'
              : null

        if (newDirection === null) {
          delete newOptions.sortBy
          delete newOptions.sortOrder
          sortBy = null
          sortOrder = null
        } else {
          newOptions.sortBy = columnId
          newOptions.sortOrder = newDirection
          sortBy = columnId
          sortOrder = newDirection
        }
      } else {
        newOptions.sortBy = columnId
        newOptions.sortOrder = 'asc'
        sortBy = columnId
        sortOrder = 'asc'
      }

      return newOptions
    })
    setSortBy(sortBy)
    setSortOrder(sortOrder)
  }

  // Render sort icon
  const renderSortIcon = (columnId: string) => {
    if (columnId !== sortBy) return null

    if (sortOrder === 'asc') {
      return <ArrowDown className='w-4 h-4 ml-2' />
    } else if (sortOrder === 'desc') {
      return <ArrowUp className='w-4 h-4 ml-2' />
    }

    return null
  }

  // Helper function to get flex alignment class
  const getFlexAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'left':
        return 'justify-start'
      case 'center':
        return 'justify-center'
      case 'right':
        return 'justify-end'
      default:
        return 'justify-start'
    }
  }

  return (
    <div className={`${className}`}>
      {/* Filters Section */}
      {showFilters && customFilters && <div className='py-4 border-b border-border'>{customFilters}</div>}

      {/* Table Section */}
      <div className='relative'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-border/40'>
              <tr>
                {columns.map((column, index) => {
                  const canSort = column.sortable !== false && column.enableSorting !== false
                  const headerFlexAlign = getFlexAlignmentClass(column?.headerAlign)

                  return (
                    <th
                      key={column.id}
                      className={`px-4 py-3 text-light text-sm font-medium whitespace-nowrap ${
                        canSort ? 'cursor-pointer select-none hover:text-light/80' : ''
                      } ${index === 0 ? 'rounded-l-lg' : ''} ${index === columns.length - 1 ? 'rounded-r-lg' : ''}`}
                      onClick={() => handleSorting(column.id, canSort)}
                    >
                      <div className={`flex items-center gap-2 ${headerFlexAlign}`}>
                        <span>{column.header}</span>
                        {canSort && renderSortIcon(column.id)}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody className='relative'>
              {tableData.length > 0 ? (
                tableData.map((row, rowIndex) => {
                  const rowId = row[rowKey]
                  const isSelected = selectedRowId === rowId
                  return (
                    <tr
                      key={rowIndex}
                      onClick={() => handleRowClick(row)}
                      className={`border-b border-border transition-colors cursor-pointer ${
                        isSelected ? 'bg-gray-800 hover:bg-gray-900' : 'hover:bg-gray-900'
                      }`}
                    >
                      {columns.map(column => (
                        <td
                          key={column.id}
                          className={`px-4 py-3 text-light text-sm whitespace-nowrap`}
                        >
                          {column.cell(row)}
                        </td>
                      ))}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className='text-center py-8'>
                    <div className='flex flex-col items-center justify-center text-gray h-[34vh]'>
                      <svg className='w-12 h-12 mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={1.5}
                          d='M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4'
                        />
                      </svg>
                      <span>{emptyMessage}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className='absolute inset-0 backdrop-blur-xs flex items-center justify-center'>
            <SpinnerCustom size='size-8' />
          </div>
        )}
      </div>

      {/* Pagination Section */}
      {pagination && tableData.length > 0 && (
        <Pagination
          total={total}
          from={from}
          to={to}
          currentPage={currentPage}
          perPage={perPage}
          totalPages={totalPages}
          isLoading={isLoading}
          onPageChange={updatePageNumber}
          onPageSizeChange={updatePageSize}
        />
      )}
    </div>
  )
}

export default CommonTable
