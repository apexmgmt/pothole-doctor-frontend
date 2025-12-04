import { ReactNode } from 'react'

const TreeConnector: React.FC<{
  isFirstItem: boolean
  isLastItem: boolean
  level: number
  resolvedIcon: ReactNode
}> = ({ isFirstItem, isLastItem, level, resolvedIcon }) => {
  if (level > 0) {
    return (
      <span
        className={`absolute bottom-0 -translate-y-5 border-b border-[#4d4d4d] ${level > 1 ? 'left-0 w-2' : '-left-4 w-6'} ${isLastItem ? 'h-6 border-l rounded-bl-2xl' : 'h-0'}`}
      />
    )
  }

  return <>{resolvedIcon}</>
}

export default TreeConnector
