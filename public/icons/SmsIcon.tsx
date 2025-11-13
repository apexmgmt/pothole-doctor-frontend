import React from 'react'

/**
 * SmsIcon SVG component.
 * @returns {JSX.Element} The SMS icon.
 */
const SmsIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <g opacity='0.7'>
      <path
        d='M1 2C1 1.44772 1.44772 1 2 1H10C10.5523 1 11 1.44772 11 2V8C11 8.55228 10.5523 9 10 9H2C1.44772 9 1 8.55228 1 8V2Z'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M3 4H9' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M3 6H7' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
    </g>
  </svg>
)

export default SmsIcon
