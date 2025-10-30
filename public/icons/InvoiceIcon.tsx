import React from 'react'

/**
 * InvoiceIcon SVG component.
 * @returns {JSX.Element} The Invoice icon.
 */
const InvoiceIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <g opacity='0.7'>
      <path
        d='M10.25 5.25V5C10.25 3.11438 10.2499 2.17158 9.6642 1.58579C9.0784 1 8.1356 1 6.24995 1H5.75C3.86442 1 2.92162 1 2.33583 1.58578C1.75005 2.17156 1.75004 3.11436 1.75002 4.99997L1.75 7.25C1.74999 8.8937 1.74998 9.7156 2.20394 10.2688C2.28706 10.3701 2.37993 10.4629 2.48121 10.5461C3.03439 11 3.85625 11 5.49995 11'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M3.75 3.5H8.25' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M3.75 6H6.75' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M10.25 10V8.5C10.25 7.7853 9.57845 7 8.75 7C7.92155 7 7.25 7.7853 7.25 8.5V10.25C7.25 10.6642 7.5858 11 8 11C8.4142 11 8.75 10.6642 8.75 10.25V8.5'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M8.75 8.5H9.5' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
    </g>
  </svg>
)

export default InvoiceIcon
