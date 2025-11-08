import Header from '@/components/erp/common/Header'
import Sidebar from '@/components/erp/common/menus/Sidebar'
import { ReactNode } from '@/types'
import { decryptData } from '@/utils/encryption'
import { cookies } from 'next/headers'

const Layout = async ({ children }: ReactNode) => {
  const cookieStore = await cookies() // cookies() is synchronous
  const userCookie = cookieStore.get('user')?.value || '{}'
  const decryptedUser: unknown = decryptData(userCookie)

  let user: Record<string, unknown> = {}

  if (process.env.NODE_ENV === 'development') {
    user =
      typeof decryptedUser === 'string'
        ? (JSON.parse(decryptedUser) as Record<string, unknown>)
        : (decryptedUser as Record<string, unknown>)
  } else {
    user = decryptedUser as Record<string, unknown>
  }

  return (
    <section className='flex min-h-screen relative overflow-hidden h-screen'>
      <aside className='w-[260px]'>
        <Sidebar user={user} />
      </aside>
      <section className='w-[calc(100%-260px)] flex flex-col'>
        <Header />
        <main className='flex-1 overflow-y-auto p-6'>{children}</main>
      </section>
    </section>
  )
}

export default Layout
