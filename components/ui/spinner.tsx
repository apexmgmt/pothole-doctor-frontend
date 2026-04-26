import { LoaderIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return <LoaderIcon role='status' aria-label='Loading' className={cn('size-4 animate-spin', className)} {...props} />
}

export function SpinnerCustom({
  position = 'absolute',
  zIndex = 10,
  className,
  size = 'size-8'
}: {
  position?: React.CSSProperties['position']
  zIndex?: number
  className?: string
  size?: string
}) {
  return (
    <div
      className={cn('inset-0 flex flex-col items-center justify-center', className)}
      style={{
        position,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex
      }}
    >
      <Spinner className={size} />
    </div>
  )
}
