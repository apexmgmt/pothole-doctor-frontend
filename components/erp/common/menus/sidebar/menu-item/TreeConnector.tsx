import React, { ReactNode } from 'react'

const TreeConnector: React.FC<{
  isLastItem?: boolean
  level: number
  resolvedIcon: ReactNode
}> = ({ isLastItem, level, resolvedIcon }) => {
  if (level > 0) {
    const verticalPosition = level > 1 ? '-left-1.5 w-3!' : '-left-3.5'
    const horizontalPosition = level > 1 ? '-left-1.5 w-3!' : '-left-3.5'
    const lastItemRound = level > 1 ? 'rounded-bl-lg' : 'rounded-bl-xl'

    if (isLastItem) {
      return (
        <span
          className={`absolute ${verticalPosition} -top-1.5 h-5 w-4 ${lastItemRound} border-b border-l border-border`}
        />
      )
    }

    return (
      <>
        <span className={`absolute ${verticalPosition} top-0 h-full w-0 border-l border-border`} />
        <span className={`absolute ${horizontalPosition} top-3.5 w-4 border-b border-border`} />
      </>
    )
  }

  return <>{resolvedIcon}</>
}

export default TreeConnector
