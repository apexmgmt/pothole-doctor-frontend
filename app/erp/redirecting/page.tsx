import { Suspense } from 'react'
import RedirectingView from '@/views/erp/RedirectingView'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ data?: string }>
}

export default async function RedirectingPage({ searchParams }: PageProps) {
  const params = await searchParams
  const encryptedData = params.data

  if (!encryptedData) {
    // redirect to login page /erp/login
    redirect('/erp/login')

    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h1 className='text-2xl font-semibold text-red-500 mb-4'>Error</h1>
          <p className='text-gray-600 mb-4'>No authentication data received</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <RedirectingView encryptedData={encryptedData} />
    </Suspense>
  )
}

function LoadingFallback() {
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
        <h1 className='text-2xl font-semibold text-gray-700 mb-2'>Loading...</h1>
      </div>
    </div>
  )
}
