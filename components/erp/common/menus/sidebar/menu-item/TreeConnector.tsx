import React, { ReactNode } from 'react'

const TreeConnector: React.FC<{
  isLastItem?: boolean
  level: number
  resolvedIcon: ReactNode
}> = ({ isLastItem, level, resolvedIcon }) => {
  if (level > 0) {
    return (
      <span
        className={`absolute bottom-0 -translate-y-4 border-b border-border ${level > 1 ? '-left-1 w-3' : '-left-3 w-4'} ${isLastItem ? 'h-6 border-l rounded-bl-2xl' : 'h-0'}`}
      />
    )
  }

  return <>{resolvedIcon}</>
}

export default TreeConnector
