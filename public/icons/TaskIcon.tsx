import React from 'react'

/**
 * TrashIcon SVG component.
 * @returns {JSX.Element} The Trash icon.
 */
const TaskIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path
      d='M9.66415 1.33398H6.33081C5.77853 1.33398 5.33081 1.7817 5.33081 2.33398C5.33081 2.88627 5.77853 3.33398 6.33081 3.33398H9.66415C10.2164 3.33398 10.6642 2.88627 10.6642 2.33398C10.6642 1.7817 10.2164 1.33398 9.66415 1.33398Z'
      stroke='currentColor'
      strokeWidth='1.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M5.33081 10.0007H7.61655M5.33081 7.33398H10.6642'
      stroke='currentColor'
      strokeWidth='1.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M10.6641 2.33398C11.6997 2.3652 12.3174 2.4807 12.7449 2.90823C13.3307 3.49402 13.3307 4.43681 13.3307 6.3224V10.6669C13.3307 12.5526 13.3307 13.4954 12.7449 14.0812C12.1591 14.6669 11.2163 14.6669 9.33074 14.6669H6.66406C4.77845 14.6669 3.83564 14.6669 3.24986 14.0812C2.66407 13.4954 2.66407 12.5526 2.66406 10.667L2.66408 6.32244C2.66407 4.43682 2.66407 3.49401 3.24986 2.90822C3.67738 2.4807 4.29508 2.36519 5.33066 2.33398'
      stroke='currentColor'
      strokeWidth='1.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default TaskIcon
