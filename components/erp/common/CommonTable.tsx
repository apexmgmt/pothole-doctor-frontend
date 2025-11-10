'use client'

import React, { useMemo, ReactNode, useState } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select'
import { SpinnerCustom } from '@/components/ui/spinner'

type Column = {
  id: string
  header: string
  cell: (row: any) => ReactNode
  sortable?: boolean
  enableSorting?: boolean
}

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
  const pageSizes = [10, 25, 50, 100]
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(null)

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
        } else {
          newOptions.sortBy = columnId
          newOptions.sortOrder = newDirection
        }
      } else {
        newOptions.sortBy = columnId
        newOptions.sortOrder = 'asc'
      }

      return newOptions
    })
  }

  // Render sort icon
  const renderSortIcon = (columnId: string, sortBy?: string, sortingDirection?: 'asc' | 'desc' | null) => {
    if (columnId !== sortBy) return null

    return (
      <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg' className='ml-2'>
        <path
          d='M8.25 3.75L6 1.5L3.75 3.75'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className={sortingDirection === 'asc' ? 'opacity-100' : 'opacity-40'}
        />
        <path
          d='M8.25 8.25L6 10.5L3.75 8.25'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className={sortingDirection === 'desc' ? 'opacity-100' : 'opacity-40'}
        />
      </svg>
    )
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
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

                  return (
                    <th
                      key={column.id}
                      className={`px-4 py-3 text-left text-light text-sm font-medium whitespace-nowrap ${
                        canSort ? 'cursor-pointer select-none hover:text-light/80' : ''
                      } ${index === 0 ? 'rounded-l-lg' : ''} ${index === columns.length - 1 ? 'rounded-r-lg' : ''}`}
                      onClick={() => handleSorting(column.id, canSort)}
                    >
                      <div className='flex items-center'>
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
                        <td key={column.id} className='px-4 py-3 text-light text-sm whitespace-nowrap'>
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
        <div className='flex items-center justify-between border-t border-border px-4 py-3'>
          {/* Left side - Rows per page */}
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray'>Rows per page</span>
              <Select value={String(perPage)} onValueChange={v => updatePageSize(Number(v))}>
                <SelectTrigger className='w-20'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizes.map(size => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <span className='text-sm text-gray whitespace-nowrap'>
              Showing {from} to {to} of {total} entries
            </span>
          </div>

          {/* Right side - Pagination controls */}
          <div className='flex items-center gap-1'>
            {/* First page */}
            <button
              onClick={() => updatePageNumber(1)}
              disabled={currentPage === 1 || isLoading}
              className='p-2 rounded text-gray hover:text-light hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
              title='First page'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 19l-7-7 7-7m8 14l-7-7 7-7' />
              </svg>
            </button>

            {/* Previous page */}
            <button
              onClick={() => updatePageNumber(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isLoading}
              className='p-2 rounded text-gray hover:text-light hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
              title='Previous page'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
              </svg>
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className='px-3 py-1 text-gray'>...</span>
                ) : (
                  <button
                    onClick={() => updatePageNumber(page as number)}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      currentPage === page
                        ? 'bg-light text-bg font-medium'
                        : 'text-gray hover:text-light hover:bg-accent'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}

            {/* Next page */}
            <button
              onClick={() => updatePageNumber(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0 || isLoading}
              className='p-2 rounded text-gray hover:text-light hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
              title='Next page'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </button>

            {/* Last page */}
            <button
              onClick={() => updatePageNumber(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0 || isLoading}
              className='p-2 rounded text-gray hover:text-light hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
              title='Last page'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 5l7 7-7 7M5 5l7 7-7 7' />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommonTable
