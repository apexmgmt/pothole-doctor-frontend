import React from 'react'

/**
 * CRMIcon SVG component.
 * @returns {JSX.Element} The CRM icon.
 */
const CRMIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path
      d='M8.00016 14H2.66683C1.93045 14 1.3335 13.4031 1.3335 12.6667V3.33333C1.3335 2.59695 1.93045 2 2.66683 2H13.3335C14.0699 2 14.6668 2.59695 14.6668 3.33333V8.33333'
      stroke='white'
      strokeWidth='1.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path d='M1.3335 6H14.6668' stroke='white' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
    <path d='M1.3335 10H8.00016' stroke='white' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
    <path
      d='M11.7204 8.84519C11.8312 8.60759 12.1691 8.60759 12.28 8.84519L12.6978 9.74059C12.8819 10.1349 13.1989 10.4519 13.5932 10.636L14.4886 11.0539C14.7262 11.1647 14.7262 11.5026 14.4886 11.6135L13.5932 12.0313C13.1989 12.2154 12.8819 12.5324 12.6978 12.9267L12.28 13.8221C12.1691 14.0597 11.8312 14.0597 11.7204 13.8221L11.3025 12.9267C11.1184 12.5324 10.8014 12.2154 10.4071 12.0313L9.5117 11.6135C9.2741 11.5026 9.2741 11.1647 9.5117 11.0539L10.4071 10.636C10.8014 10.4519 11.1184 10.1349 11.3025 9.74059L11.7204 8.84519Z'
      stroke='white'
      strokeWidth='1.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path d='M5.3335 2V14' stroke='white' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
  </svg>
)

export default CRMIcon
