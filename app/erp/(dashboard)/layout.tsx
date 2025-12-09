import Header from '@/components/erp/common/Header'
import Sidebar from '@/components/erp/common/menus/sidebar'
import { ReactNode } from '@/types'
import { decryptData } from '@/utils/encryption'
import CookieService from '@/services/app/cookie.service'
import { CheckAuthProvider } from '@/hocs/CheckAuthProvider'

const Layout = async ({ children }: ReactNode) => {
  const userCookie = await CookieService.get('user')
  const decryptedUser: unknown = userCookie ? decryptData(userCookie) : null

  let user: Record<string, unknown> = {}

  if (decryptedUser) {
    if (process.env.NODE_ENV === 'development') {
      user =
        typeof decryptedUser === 'string'
          ? (JSON.parse(decryptedUser) as Record<string, unknown>)
          : (decryptedUser as Record<string, unknown>)
    } else {
      user = decryptedUser as Record<string, unknown>
    }
  }

  return (
    <CheckAuthProvider>
      <section className='flex min-h-screen relative overflow-hidden h-screen'>
        <aside className='w-[260px]'>
          <Sidebar user={user} />
        </aside>
        <section className='w-[calc(100%-260px)] flex flex-col'>
          <Header />
          <main className='flex-1 overflow-y-auto p-6'>{children}</main>
        </section>
      </section>
    </CheckAuthProvider>
  )
}

export default Layout
