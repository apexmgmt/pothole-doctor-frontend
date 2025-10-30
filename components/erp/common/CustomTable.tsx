'use client'

import React, { useState, useMemo, ReactNode } from 'react'
import CustomButton from './CustomButton'
import { FilterIcon, PDFIcon, ExcelIcon, SearchIcon } from '@/public/icons'

type Column = {
  key: string
  label: string
  sortable?: boolean
  whitespace?: string
  conditional?: () => boolean
}

type ExportOption = {
  label: string
  value: string
  icon?: React.ComponentType<any> | ReactNode
  conditional?: () => boolean
}

type ActionButton = {
  label: string
  action: string
  variant: string
  icon?: React.ComponentType<any> | ReactNode
}

interface CustomTableProps {
  data?: any[]
  columns?: Column[]
  showToolbar?: boolean
  showFilter?: boolean
  showSearch?: boolean
  showActionButtons?: boolean
  showExport?: boolean
  searchPlaceholder?: string
  onSearch?: (data: any[], searchTerm: string) => any[]
  exportOptions?: (ExportOption | string)[]
  onExport?: (format: string, data: any[]) => void
  actionButtons?: ActionButton[]
  onActionButtonClick?: (action: string, row?: any) => void
  showPagination?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  showRowSelection?: boolean
  onRowSelectionChange?: (selectedRows: any[]) => void
  selectedRows?: any[]
  showSorting?: boolean
  onSort?: (data: any[], column: string, direction: string) => any[]
  defaultSort?: { column: string | null; direction: 'asc' | 'desc' }
  className?: string
  tableClassName?: string
  headerClassName?: string
  rowClassName?: string
  loading?: boolean
  emptyMessage?: string
  renderCell?: (row: any, column: Column, value: any) => ReactNode
  renderActions?: (row: any) => ReactNode
  showRowNumbers?: boolean
  stickyHeader?: boolean
  maxHeight?: number
  onRowClick?: (row: any) => void
  rowKey?: string
  columnWhitespace?: string
}

const CustomTable: React.FC<CustomTableProps> = ({
  data = [],
  columns = [],
  showToolbar = true,
  showFilter = true,
  showSearch = true,
  showActionButtons = true,
  showExport = false,
  searchPlaceholder = 'Search...',
  onSearch,
  exportOptions = [
    {
      label: 'Excel',
      value: 'Excel',
      icon: ExcelIcon,
      conditional: () => true
    },
    {
      label: 'PDF',
      value: 'PDF',
      icon: PDFIcon,
      conditional: () => true
    }
  ],
  onExport,
  actionButtons = [],
  onActionButtonClick,
  showPagination = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  showRowSelection = true,
  onRowSelectionChange,
  selectedRows = [],
  showSorting = true,
  onSort,
  defaultSort = { column: null, direction: 'asc' },
  className = '',
  tableClassName = '',
  headerClassName = '',
  rowClassName = '',
  loading = false,
  emptyMessage = 'No data available',
  renderCell,
  renderActions,
  showRowNumbers = false,
  stickyHeader = true,
  maxHeight = 400,
  onRowClick,
  rowKey = 'id',
  columnWhitespace = 'nowrap'
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [currentPageSize, setCurrentPageSize] = useState<number>(pageSize)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortConfig, setSortConfig] = useState<{ column: string | null; direction: 'asc' | 'desc' }>(defaultSort)
  const [localSelectedRows, setLocalSelectedRows] = useState<any[]>(selectedRows)

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let searchFilteredData = data

    if (searchTerm && onSearch) {
      searchFilteredData = onSearch(data, searchTerm)
    } else if (searchTerm) {
      searchFilteredData = data.filter(row =>
        Object.values(row).some(value => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (sortConfig.column && onSort) {
      return onSort(searchFilteredData, sortConfig.column, sortConfig.direction)
    } else if (sortConfig.column) {
      return [...searchFilteredData].sort((a, b) => {
        const aVal = a[sortConfig.column as string]
        const bVal = b[sortConfig.column as string]

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return searchFilteredData
  }, [data, searchTerm, sortConfig, onSearch, onSort])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(processedData.length / currentPageSize))
  const startIndex = (currentPage - 1) * currentPageSize
  const endIndex = startIndex + currentPageSize
  const paginatedData = processedData.slice(startIndex, endIndex)

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleSort = (column: string) => {
    if (!showSorting) return

    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handlePageChange = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
    onPageChange?.(validPage)
  }

  const handlePageSizeChange = (size: number) => {
    setCurrentPageSize(size)
    setCurrentPage(1)
    onPageSizeChange?.(size)
  }

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? paginatedData.map(row => row[rowKey]) : []
    setLocalSelectedRows(newSelection)
    onRowSelectionChange?.(newSelection)
  }

  const handleSelectRow = (rowId: any, checked: boolean) => {
    const newSelection = checked ? [...localSelectedRows, rowId] : localSelectedRows.filter(id => id !== rowId)

    setLocalSelectedRows(newSelection)
    onRowSelectionChange?.(newSelection)
  }

  const handleExport = (format: string) => {
    if (onExport) {
      onExport(format, processedData)
    } else {
      console.log(`Exporting ${format} data:`, processedData)
    }
  }

  const handleActionButton = (action: string, row: any = null) => {
    if (onActionButtonClick) {
      onActionButtonClick(action, row)
    }
  }

  const handleRowClick = (row: any) => {
    if (onRowClick) {
      onRowClick(row)
    }
  }

  // Render functions
  const renderSortIcon = (column: string) => {
    if (!showSorting) return null

    if (sortConfig.column === column) {
      return (
        <div className='ml-2'>
          <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M8.25 3.75L6 1.5L3.75 3.75'
              stroke='#fff'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              className={`${sortConfig.direction === 'asc' ? 'opacity-40' : 'opacity-100'}`}
            />
            <path
              d='M8.25 8.25L6 10.5L3.75 8.25'
              stroke='#fff'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              className={`${sortConfig.direction === 'asc' ? 'opacity-100' : 'opacity-40'}`}
            />
          </svg>
        </div>
      )
    }

    return (
      <div className='ml-2'>
        <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M8.25 3.75L6 1.5L3.75 3.75'
            stroke='#656565'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M8.25 8.25L6 10.5L3.75 8.25'
            stroke='#656565'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>
    )
  }

  const renderCellContent = (row: any, column: Column) => {
    if (renderCell) {
      return renderCell(row, column, row[column.key])
    }

    if (column.key.toLowerCase().includes('status') || column.key.toLowerCase().includes('stage')) {
      return renderStatusBadge(row[column.key])
    }

    return row[column.key]
  }

  const renderStatusBadge = (value: string) => {
    const statusColors: { [key: string]: string } = {
      open: 'bg-gray-500/20 text-green-400',
      success: 'bg-gray-500/20 text-green-400',
      completed: 'bg-gray-500/20 text-green-400',
      active: 'bg-gray-500/20 text-green-400',
      approved: 'bg-gray-500/20 text-green-400',
      'job completed': 'bg-gray-500/20 text-green-400',
      'in progress': 'bg-gray-500/20 text-green-400',
      'job in progress': 'bg-gray-500/20 text-green-400',
      'quote in progress': 'bg-gray-500/20 text-green-400',
      danger: 'bg-gray-500/20 text-red-400',
      error: 'bg-gray-500/20 text-red-400',
      failed: 'bg-gray-500/20 text-red-400',
      rejected: 'bg-gray-500/20 text-red-400',
      cancelled: 'bg-gray-500/20 text-red-400',
      'closed-won': 'bg-gray-500/20 text-red-400',
      warning: 'bg-gray-500/20 text-orange-400',
      pending: 'bg-gray-500/20 text-orange-400',
      processing: 'bg-gray-500/20 text-orange-400',
      working: 'bg-gray-500/20 text-orange-400',
      info: 'bg-gray-500/20 text-blue-400',
      new: 'bg-gray-500/20 text-blue-400',
      'meeting set': 'bg-gray-500/20 text-blue-400',
      'quote voided': 'bg-gray-500/20 text-blue-400',
      neutral: 'bg-gray-500/20 text-gray-400',
      draft: 'bg-gray-500/20 text-gray-400',
      prospect: 'bg-gray-500/20 text-gray-400'
    }

    const normalizedValue = value?.toLowerCase() || ''
    const colorClass = statusColors[normalizedValue] || 'bg-gray-500/20 text-gray-400'

    return <span className={`px-2 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${colorClass}`}>{value}</span>
  }

  const renderActionsCell = (row: any) => {
    if (renderActions) {
      return renderActions(row)
    }

    return (
      <div className='flex gap-2 items-center'>
        <button
          onClick={e => {
            e.stopPropagation()
            console.log('View:', row)
          }}
          className='h-5 w-5 flex items-center justify-center border border-border hover:bg-blue-400/10 rounded-md transition-colors cursor-pointer'
          title='View'
        >
          {/* ...SVG omitted for brevity... */}
          <svg width='13' height='12' viewBox='0 0 13 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M7.10059 2.5H4.40039C3.9721 2.5 3.68012 2.50017 3.45508 2.51855C3.23615 2.53647 3.12405 2.56956 3.0459 2.60938C2.85795 2.70522 2.70521 2.85795 2.60938 3.0459C2.56958 3.12404 2.53646 3.23625 2.51855 3.45508C2.50018 3.6801 2.5 3.97218 2.5 4.40039V8.40039C2.5 8.82839 2.50018 9.11977 2.51855 9.34473C2.53647 9.5637 2.56955 9.67575 2.60938 9.75391C2.70525 9.94198 2.8578 10.0956 3.0459 10.1914C3.12404 10.2312 3.23628 10.2633 3.45508 10.2812C3.68012 10.2996 3.97211 10.2998 4.40039 10.2998H8.40039C8.82846 10.2998 9.11975 10.2996 9.34473 10.2812C9.56351 10.2634 9.67575 10.2312 9.75391 10.1914C9.94203 10.0956 10.0955 9.94202 10.1914 9.75391C10.2312 9.67576 10.2634 9.56347 10.2812 9.34473C10.2996 9.11977 10.2998 8.82839 10.2998 8.40039V5.7002L11.2998 4.7002V8.40039C11.2998 8.81186 11.3008 9.15072 11.2783 9.42578C11.2554 9.70678 11.2057 9.96538 11.082 10.208C10.8903 10.5843 10.5843 10.8903 10.208 11.082C9.96536 11.2057 9.70681 11.2554 9.42578 11.2783C9.15069 11.3008 8.81192 11.2998 8.40039 11.2998H4.40039C3.98861 11.2998 3.64923 11.3008 3.37402 11.2783C3.09301 11.2554 2.83444 11.2057 2.5918 11.082C2.21559 10.8903 1.90949 10.5842 1.71777 10.208C1.59417 9.9654 1.54543 9.70675 1.52246 9.42578C1.49999 9.1507 1.5 8.81189 1.5 8.40039V4.40039C1.5 3.98867 1.49999 3.64921 1.52246 3.37402C1.54542 3.09305 1.59418 2.83441 1.71777 2.5918C1.9095 2.21556 2.21557 1.90951 2.5918 1.71777C2.83443 1.59414 3.09302 1.54543 3.37402 1.52246C3.64923 1.49998 3.9886 1.5 4.40039 1.5H8.09961L7.10059 2.5ZM9.64648 0.84668C9.84171 0.651454 10.1582 0.651526 10.3535 0.84668L11.9541 2.44629C12.149 2.64144 12.1489 2.95812 11.9541 3.15332L8.81152 6.2959C8.73556 6.37185 8.64685 6.43535 8.55078 6.4834L6.20117 7.6582L6.12988 7.73047L6.10547 7.70605L5.42383 8.04785C5.23158 8.14386 4.99881 8.10583 4.84668 7.9541C4.69464 7.80205 4.65699 7.56935 4.75293 7.37695L5.09375 6.69434L5.06934 6.66992L5.14258 6.5957L6.31641 4.24902C6.36445 4.15293 6.42795 4.06523 6.50391 3.98926L9.64648 0.84668ZM7.21094 4.69629L6.37109 6.37207L6.42578 6.42676L8.10449 5.58887L10.8926 2.7998L10 1.90625L7.21094 4.69629Z'
              fill='#F4F4F5'
            />
          </svg>
        </button>
        <button
          onClick={e => {
            e.stopPropagation()
            console.log('Edit:', row)
          }}
          className='h-5 w-5 flex items-center justify-center border border-border hover:bg-blue-400/10 rounded-md transition-colors cursor-pointer'
          title='Edit'
        >
          {/* ...SVG omitted for brevity... */}
          <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M9.75 2.75L9.44015 7.76255C9.36095 9.0432 9.3214 9.68355 9.0004 10.144C8.84165 10.3716 8.63735 10.5637 8.40035 10.708C7.92105 11 7.2795 11 5.99635 11C4.71156 11 4.06915 11 3.58952 10.7074C3.3524 10.5628 3.148 10.3704 2.98934 10.1424C2.66844 9.6813 2.62972 9.04005 2.5523 7.7576L2.25 2.75'
              stroke='#F4F4F5'
              strokeLinecap='round'
            />
            <path
              d='M1.5 2.75H10.5M8.02785 2.75L7.68655 2.04587C7.4598 1.57813 7.3464 1.34426 7.15085 1.19841C7.1075 1.16605 7.06155 1.13727 7.0135 1.11235C6.79695 1 6.53705 1 6.01725 1C5.4844 1 5.218 1 4.99784 1.11706C4.94905 1.143 4.90249 1.17295 4.85864 1.20659C4.66082 1.35835 4.55032 1.60078 4.32931 2.08563L4.02646 2.75'
              stroke='#F4F4F5'
              strokeLinecap='round'
            />
            <path d='M4.75 8.25V5.25' stroke='#F4F4F5' strokeLinecap='round' />
            <path d='M7.25 8.25V5.25' stroke='#F4F4F5' strokeLinecap='round' />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className={` ${className}`}>
      {/* Toolbar Section */}
      {showToolbar && (
        <div className={`py-4 ${headerClassName}`}>
          <div className='flex items-center justify-between gap-4'>
            {/* Left side - Filter Button or Export Options */}
            <div className='flex items-center gap-4'>
              {showFilter ? (
                <button
                  onClick={() => handleActionButton('filter')}
                  className='flex items-center gap-2 px-3 py-1.5 bg-bg border border-border rounded-md text-light hover:bg-accent transition-colors'
                >
                  <FilterIcon />
                  Filter
                </button>
              ) : showExport ? (
                <div className='flex gap-2'>
                  {exportOptions.map(option => {
                    const exportOption =
                      typeof option === 'string'
                        ? {
                            label: option,
                            value: option,
                            conditional: () => true
                          }
                        : option

                    if (exportOption.conditional && !exportOption.conditional()) {
                      return null
                    }

                    return (
                      <CustomButton
                        key={exportOption.value || exportOption.label}
                        onClick={() => handleExport(exportOption.value || exportOption.label)}
                        variant='outline'
                        size='sm'
                        icon={exportOption.icon}
                      >
                        {exportOption.label}
                      </CustomButton>
                    )
                  })}
                </div>
              ) : null}

              {/* Search Field */}
              {showSearch && (
                <div className='relative max-w-md'>
                  <label
                    htmlFor='search-input'
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer'
                  >
                    <SearchIcon />
                  </label>
                  <input
                    type='text'
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    id='search-input'
                    onChange={e => handleSearch(e.target.value)}
                    className='w-full pl-10 pr-4 py-2 bg-transparent border border-border rounded-md text-light placeholder:text-gray focus:outline-none focus:border-light text-sm'
                  />
                </div>
              )}
            </div>

            {/* Right side - Action Buttons and Export Options (only when filter is enabled) */}
            <div className='flex items-center gap-2'>
              {showExport && showFilter && (
                <div className='flex gap-2'>
                  {exportOptions.map(option => {
                    const exportOption =
                      typeof option === 'string'
                        ? {
                            label: option,
                            value: option,
                            conditional: () => true
                          }
                        : option

                    if (exportOption.conditional && !exportOption.conditional()) {
                      return null
                    }

                    return (
                      <CustomButton
                        key={exportOption.value || exportOption.label}
                        onClick={() => handleExport(exportOption.value || exportOption.label)}
                        variant='outline'
                        size='sm'
                        icon={exportOption.icon}
                      >
                        {exportOption.label}
                      </CustomButton>
                    )
                  })}
                </div>
              )}

              {/* Action Buttons */}
              {showActionButtons && actionButtons.length > 0 && (
                <div className='flex gap-2'>
                  {actionButtons.map((button, index) => (
                    <button
                      key={index}
                      onClick={() => onActionButtonClick && onActionButtonClick(button.action)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        button.variant === 'primary'
                          ? 'bg-light text-bg hover:bg-light/90'
                          : 'bg-bg border border-border text-light hover:bg-accent'
                      }`}
                    >
                      {button.icon &&
                        (React.isValidElement(button.icon)
                          ? button.icon
                          : typeof button.icon === 'function'
                            ? React.createElement(button.icon)
                            : null)}
                      {button.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className={`overflow-x-auto ${
          maxHeight ? `max-h-[${maxHeight}px] overflow-y-auto [scrollbar-width:thin]` : ''
        }`}
      >
        <table className={`w-full ${tableClassName}`}>
          <thead className={`bg-border/40 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              {columns.map((column, index) => {
                if (column.conditional && !column.conditional()) {
                  return null
                }

                return (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-light text-sm font-medium ${
                      column.whitespace === 'normal' ? 'min-w-[180px]' : 'whitespace-nowrap'
                    } ${
                      showSorting && column.sortable !== false ? 'cursor-pointer hover:text-light' : ''
                    } ${index === 0 ? 'rounded-l-lg' : ''} ${index === columns.length - 1 ? 'rounded-r-lg' : ''}`}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                  >
                    <div className='flex items-center'>
                      {column.key === 'checkbox' ? (
                        <label className='flex items-center cursor-pointer select-none group'>
                          <input
                            type='checkbox'
                            checked={localSelectedRows.length === paginatedData.length && paginatedData.length > 0}
                            onChange={e => handleSelectAll(e.target.checked)}
                            className='peer sr-only'
                          />
                          <span
                            className='relative inline-flex size-5 items-center justify-center rounded-sm border border-border peer-checked:bg-bg/60
                            transition-colors duration-150
                            peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-light
                            peer-checked:border-light bg-light/10'
                          >
                            <svg
                              className='absolute w-3 h-3 text-light opacity-0 group-has-[input:checked]:opacity-100 transition-opacity duration-150 pointer-events-none z-10'
                              xmlns='http://www.w3.org/2000/svg'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='3'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            >
                              <polyline points='20 6 9 17 4 12' />
                            </svg>
                          </span>
                        </label>
                      ) : column.key === 'actions' ? (
                        column.label || 'Actions'
                      ) : (
                        <>
                          {column.label}
                          {showSorting && column.sortable !== false && renderSortIcon(column.key)}
                        </>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={
                    columns.filter(col => !col.conditional || col.conditional()).length + (showRowNumbers ? 1 : 0)
                  }
                  className='px-4 py-8 text-center text-gray'
                >
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.filter(col => !col.conditional || col.conditional()).length + (showRowNumbers ? 1 : 0)
                  }
                  className='px-4 py-8 text-center text-gray'
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={row[rowKey] || rowIndex}
                  className={`border-b border-border hover:bg-bg/30 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${rowClassName}`}
                  onClick={() => onRowClick && handleRowClick(row)}
                >
                  {showRowNumbers && <td className='px-4 py-3 text-gray text-sm'>{startIndex + rowIndex + 1}</td>}

                  {columns.map(column => {
                    if (column.conditional && !column.conditional()) {
                      return null
                    }

                    if (column.key === 'checkbox') {
                      return (
                        <td key={column.key} className='px-4 py-3'>
                          <label className='flex items-center cursor-pointer select-none group'>
                            <input
                              type='checkbox'
                              checked={localSelectedRows.includes(row[rowKey])}
                              onChange={e => handleSelectRow(row[rowKey], e.target.checked)}
                              className='peer sr-only'
                            />
                            <span
                              className='relative inline-flex size-5 items-center justify-center rounded-sm border border-border peer-checked:bg-bg/60
                              transition-colors duration-150
                              peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-light
                              peer-checked:border-light bg-light/10'
                            >
                              <svg
                                className='absolute w-3 h-3 text-light opacity-0 group-has-[input:checked]:opacity-100 transition-opacity duration-150 pointer-events-none z-10'
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='3'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              >
                                <polyline points='20 6 9 17 4 12' />
                              </svg>
                            </span>
                          </label>
                        </td>
                      )
                    }

                    if (column.key === 'actions') {
                      return (
                        <td key={column.key} className='px-4 py-3'>
                          {renderActionsCell(row)}
                        </td>
                      )
                    }

                    return (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-light text-sm ${
                          column.whitespace === 'normal' ? '' : 'whitespace-nowrap'
                        }`}
                      >
                        {renderCellContent(row, column)}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      {showPagination && (
        <div className='py-4'>
          <div className='flex flex-col sm:flex-row gap-4 items-center justify-between'>
            <div className='text-gray text-sm'>
              {localSelectedRows.length} of {processedData.length} row(s) selected
            </div>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-gray text-sm'>Rows per page</span>
                <div className='relative'>
                  <select
                    value={currentPageSize}
                    onChange={e => handlePageSizeChange(Number(e.target.value))}
                    className='appearance-none pr-8 px-2 py-1 bg-bg border border-border rounded text-light text-sm focus:outline-none focus:border-light'
                  >
                    {pageSizeOptions.map(size => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {processedData.length > currentPageSize && (
                <div className='flex items-center gap-2'>
                  <span className='text-gray text-sm'>
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className='flex gap-1'>
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className='p-1 rounded text-gray hover:text-light disabled:opacity-50 disabled:cursor-not-allowed'
                      title='First page'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11 19l-7-7 7-7m8 14l-7-7 7-7'
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className='p-1 rounded text-gray hover:text-light disabled:opacity-50 disabled:cursor-not-allowed'
                      title='Previous page'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className='p-1 rounded text-gray hover:text-light disabled:opacity-50 disabled:cursor-not-allowed'
                      title='Next page'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className='p-1 rounded text-gray hover:text-light disabled:opacity-50 disabled:cursor-not-allowed'
                      title='Last page'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13 5l7 7-7 7M5 5l7 7-7 7'
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomTable
