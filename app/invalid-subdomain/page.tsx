import { Metadata } from 'next'
import InvalidSubdomain from '@/views/erp/invalid-subdomain/InvalidSubdomain'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pothole Doctors'

export const metadata: Metadata = {
  title: `Invalid Subdomain | ${APP_NAME}`,
  description: 'The subdomain you are trying to access does not exist or is invalid.'
}

export default function InvalidSubdomainPage() {
  return <InvalidSubdomain />
}
