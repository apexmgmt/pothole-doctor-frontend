import React from 'react'

/**
 * DetailsIcon SVG component.
 * @returns {JSX.Element} The Details icon.
 */
const DetailsIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path
      d='M5.3335 4.66297H8.0121M8.0121 4.66297H13.3335C14.0699 4.66297 14.6668 5.25993 14.6668 5.99631V8M8.0121 4.66297L6.20022 2.26479C6.07422 2.09802 5.87731 2 5.6683 2H2.00016C1.63198 2 1.3335 2.29848 1.3335 2.66667V12.6667C1.3335 13.4031 1.93045 14 2.66683 14H8.0121'
      stroke='currentColor'
      strokeWidth='1.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M14.6667 10H10M14.6667 12H10M11.6667 14H10'
      stroke='currentColor'
      strokeWidth='1.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default DetailsIcon
