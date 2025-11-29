import React from 'react'

/**
 * SecurityIcon SVG component.
 * @returns {JSX.Element} The Security icon.
 */
const SecurityIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path
      d='M6.99344 1.48703L3.66677 2.74036C2.9001 3.02703 2.27344 3.9337 2.27344 4.74703V9.70037C2.27344 10.487 2.79344 11.5204 3.42677 11.9937L6.29344 14.1337C7.23344 14.8404 8.7801 14.8404 9.7201 14.1337L12.5868 11.9937C13.2201 11.5204 13.7401 10.487 13.7401 9.70037V4.74703C13.7401 3.92703 13.1134 3.02036 12.3468 2.7337L9.0201 1.48703C8.45344 1.28036 7.54677 1.28036 6.99344 1.48703Z'
      stroke='currentColor'
      strokeWidth='1.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M7.99984 8.33268C8.73622 8.33268 9.33317 7.73573 9.33317 6.99935C9.33317 6.26297 8.73622 5.66602 7.99984 5.66602C7.26346 5.66602 6.6665 6.26297 6.6665 6.99935C6.6665 7.73573 7.26346 8.33268 7.99984 8.33268Z'
      stroke='currentColor'
      strokeWidth='1.2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8 8.33398V10.334'
      stroke='currentColor'
      strokeWidth='1.2'
      strokeMiterlimit='10'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default SecurityIcon
