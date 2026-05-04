import React from 'react'

/**
 * TrashIcon SVG component.
 * @returns {JSX.Element} The Trash icon.
 */
const InvoiceIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path
      d='M2.66675 12.4312V5.37016C2.66675 3.46748 2.66675 2.51615 3.25253 1.92507C3.83832 1.33398 4.78113 1.33398 6.66675 1.33398H9.33341C11.219 1.33398 12.1618 1.33398 12.7476 1.92507C13.3334 2.51615 13.3334 3.46748 13.3334 5.37016V12.4312C13.3334 13.439 13.3334 13.9429 13.0254 14.1412C12.5221 14.4654 11.7441 13.7856 11.3528 13.5389C11.0295 13.3349 10.8679 13.233 10.6884 13.2271C10.4945 13.2207 10.33 13.3185 9.98068 13.5389L8.70675 14.3423C8.36308 14.5589 8.19128 14.6673 8.00008 14.6673C7.80888 14.6673 7.63708 14.5589 7.29341 14.3423L6.0195 13.5389C5.69618 13.3349 5.53452 13.233 5.3551 13.2271C5.16123 13.2207 4.9967 13.3185 4.64733 13.5389C4.25605 13.7856 3.47799 14.4654 2.97471 14.1412C2.66675 13.9429 2.66675 13.439 2.66675 12.4312Z'
      stroke='currentColor'
      strokeWidth='1.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M7.33325 7.33398H5.33325'
      stroke='currentColor'
      strokeWidth='1.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M9.33325 4.66602H5.33325'
      stroke='currentColor'
      strokeWidth='1.2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default InvoiceIcon
