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
  const [isClamped, setIsClamped] = React.useState(false)

  const textRef = React.useRef<HTMLParagraphElement>(null)

  React.useEffect(() => {
    const el = textRef.current

    if (!el) return

    setIsClamped(el.scrollHeight > el.clientHeight)
  }, [description, lines])

  return (
    <div className='flex flex-col gap-1'>
      <p
        ref={textRef}
        {...props}
        className={cn(
          `overflow-hidden text-sm whitespace-normal ${isTable ? 'max-w-72' : ''} ${!isExpanded ? 'line-clamp' : ''}`,
          className
        )}
        style={{
          display: isExpanded ? 'block' : '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: isExpanded ? 'unset' : lines
        }}
      >
        {description}
      </p>
      {isShowMore && isClamped && (
        <Button
          variant='link'
          size='sm'
          className='h-auto p-0 w-fit justify-start text-primary hover:no-underline'
          onClick={() => setIsExpanded(prev => !prev)}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </Button>
      )}
    </div>
  )
}
