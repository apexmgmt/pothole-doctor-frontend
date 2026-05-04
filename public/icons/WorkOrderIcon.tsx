import React from 'react'

/**
 * TrashIcon SVG component.
 * @returns {JSX.Element} The Trash icon.
 */
const WorkOrderIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path
      d='M2 7.33398C2 4.83416 2 3.58425 2.63661 2.70803C2.84221 2.42505 3.09107 2.17619 3.37405 1.97059C4.25027 1.33398 5.50018 1.33398 8 1.33398C10.4998 1.33398 11.7497 1.33398 12.6259 1.97059C12.9089 2.17619 13.1578 2.42505 13.3634 2.70803C14 3.58425 14 4.83416 14 7.33398V8.66732C14 11.1671 14 12.4171 13.3634 13.2933C13.1578 13.5763 12.9089 13.8251 12.6259 14.0307C11.7497 14.6673 10.4998 14.6673 8 14.6673C5.50018 14.6673 4.25027 14.6673 3.37405 14.0307C3.09107 13.8251 2.84221 13.5763 2.63661 13.2933C2 12.4171 2 11.1671 2 8.66732V7.33398Z'
      stroke='currentColor'
      strokeWidth='1.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M10.0001 6.33398H4.66675M6.66675 9.66732H4.66675'
      stroke='currentColor'
      strokeWidth='1.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default WorkOrderIcon
