import React, { ReactNode } from 'react'

const TreeConnector: React.FC<{
  isLastItem?: boolean
  level: number
  resolvedIcon: ReactNode
}> = ({ isLastItem, level, resolvedIcon }) => {
  if (level > 0) {
    const verticalPosition = level > 1 ? '-left-1 w-3!' : '-left-3'
    const horizontalPosition = level > 1 ? '-left-1 w-3!' : '-left-3'

    if (isLastItem) {
      return (
        <span className={`absolute ${verticalPosition} -top-1 h-5 w-4 rounded-bl-xl border-b border-l border-border`} />
      )
    }

    return (
      <>
        <span className={`absolute ${verticalPosition} top-0 h-full w-0 border-l border-border`} />
        <span className={`absolute ${horizontalPosition} top-4 w-4 border-b border-border`} />
      </>
    )
  }

  return <>{resolvedIcon}</>
}

export default TreeConnector
