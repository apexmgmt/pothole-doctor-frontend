'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  description: string
  isTable?: boolean
  length?: number
  isShowMore?: boolean
  lines?: number
}

export function Description({
  description = '',
  isTable = true,
  length = 90,
  isShowMore = true,
  lines = 2,
  className,
  ...props
}: DescriptionProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const shouldShowMore = isShowMore && description && description.length > length

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <p
        {...props}
        className={cn(
          'text-sm font-medium whitespace-normal overflow-hidden',
          isTable && 'max-w-72',
          !isExpanded && 'line-clamp'
        )}
        style={{
          display: isExpanded ? 'block' : '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: isExpanded ? 'unset' : lines
        }}
      >
        {description}
      </p>
      {shouldShowMore && (
        <Button
          variant='link'
          size='sm'
          className='h-auto p-0 w-fit justify-start text-primary hover:no-underline'
          onClick={toggleExpand}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </Button>
      )}
    </div>
  )
}
