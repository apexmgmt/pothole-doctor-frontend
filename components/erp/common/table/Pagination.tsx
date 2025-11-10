'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select'

interface PaginationProps {
  total: number
  from: number
  to: number
  currentPage: number
  perPage: number
  totalPages: number
  isLoading: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  total,
  from,
  to,
  currentPage,
  perPage,
  totalPages,
  isLoading,
  onPageChange,
  onPageSizeChange
}) => {
  const pageSizes = [10, 25, 50, 100]

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
    <div className='flex items-center justify-between border-t border-border py-3'>
      {/* Left side - Rows per page */}
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <Select value={String(perPage)} onValueChange={v => onPageSizeChange(Number(v))}>
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
        <Button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || isLoading}
          variant='ghost'
          size='icon'
          title='First page'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 19l-7-7 7-7m8 14l-7-7 7-7' />
          </svg>
        </Button>

        {/* Previous page */}
        <Button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isLoading}
          variant='ghost'
          size='icon'
          title='Previous page'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
          </svg>
        </Button>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className='px-3 py-1 text-gray'>...</span>
            ) : (
              <Button
                onClick={() => onPageChange(page as number)}
                disabled={isLoading}
                variant='ghost'
                size='sm'
                className={`${
                  currentPage === page ? 'bg-light text-bg font-medium hover:bg-light/90' : 'text-gray hover:text-light'
                }`}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        {/* Next page */}
        <Button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0 || isLoading}
          variant='ghost'
          size='icon'
          title='Next page'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
          </svg>
        </Button>

        {/* Last page */}
        <Button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0 || isLoading}
          variant='ghost'
          size='icon'
          title='Last page'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 5l7 7-7 7M5 5l7 7-7 7' />
          </svg>
        </Button>
      </div>
    </div>
  )
}

export default Pagination
