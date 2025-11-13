import React from 'react'

/**
 * SearchIcon SVG component.
 * @returns {JSX.Element} The Search icon.
 */
const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <circle
      cx='9.21552'
      cy='9.21601'
      r='5.88495'
      stroke='#F4F4F5'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M16.6695 16.67L13.3765 13.377'
      stroke='#F4F4F5'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default SearchIcon
