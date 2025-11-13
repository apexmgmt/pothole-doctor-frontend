'use client'

import React from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem
} from '@/components/ui/select'

interface TableFooterProps {
  currentPage: number
  totalPages: number
  currentPageSize: number
  pageSizeOptions: number[]
  totalRows: number
  selectedRowsCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const TableFooter: React.FC<TableFooterProps> = ({
  currentPage,
  totalPages,
  currentPageSize,
  pageSizeOptions,
  totalRows,
  selectedRowsCount,
  onPageChange,
  onPageSizeChange
}) => {
  return (
    <div className='flex items-center justify-between border-t px-4 pt-3'>
      {/* Left side - Selected rows count */}
      <div className='text-sm text-gray'>
        {selectedRowsCount} of {totalRows} row(s) selected
      </div>

      {/* Right side - Pagination controls */}
      <div className='flex items-center gap-6'>
        {/* Rows per page */}
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray'>Rows per page</span>

          <Select value={String(currentPageSize)} onValueChange={v => onPageSizeChange(Number(v))}>
            <SelectTrigger className='w-28'>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>Rows</SelectLabel>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Page info and navigation */}
        <div className='flex items-center gap-4'>
          <span className='text-sm text-gray'>
            Page {currentPage} of {totalPages}
          </span>

          <div className='flex items-center gap-1'>
            {/* First page */}
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className='p-2 rounded text-gray hover:text-light hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
              title='First page'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 19l-7-7 7-7m8 14l-7-7 7-7' />
              </svg>
            </button>

            {/* Previous page */}
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className='p-2 rounded text-gray hover:text-light hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
              title='Previous page'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
              </svg>
            </button>

            {/* Next page */}
            <button
              onClick={() => onPageChange(Math.min(totalPages || 1, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className='p-2 rounded text-gray hover:text-light hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
              title='Next page'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </button>

            {/* Last page */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className='p-2 rounded text-gray hover:text-light hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
              title='Last page'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 5l7 7-7 7M5 5l7 7-7 7' />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TableFooter
