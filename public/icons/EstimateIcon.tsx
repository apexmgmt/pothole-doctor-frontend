import React from 'react'

/**
 * EstimateIcon SVG component.
 * @returns {JSX.Element} The Estimate icon.
 */
const EstimateIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path
      d='M9.99992 10.6665C9.63172 10.6665 9.33325 10.368 9.33325 9.99979V7.33366C9.33325 6.96526 9.63205 6.66673 10.0005 6.66699L12.0005 6.66853C12.3685 6.66886 12.6666 6.96719 12.6666 7.33519V9.99979C12.6666 10.368 12.3681 10.6665 11.9999 10.6665H9.99992Z'
      stroke='white'
      strokeWidth='1.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M4.00016 10.6669C3.63198 10.6669 3.3335 10.3685 3.3335 10.0003V3.33464C3.3335 2.96604 3.63261 2.6674 4.0012 2.66797L6.0012 2.6711C6.36899 2.67167 6.66683 2.96998 6.66683 3.33776V10.0003C6.66683 10.3685 6.36835 10.6669 6.00016 10.6669H4.00016Z'
      stroke='white'
      strokeWidth='1.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path d='M14.6668 13.333H1.3335' stroke='white' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
  </svg>
)

export default EstimateIcon
