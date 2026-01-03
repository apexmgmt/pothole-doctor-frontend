import Header from '@/components/erp/common/Header'
import Sidebar from '@/components/erp/common/menus/sidebar'
import { ReactNode } from '@/types'
import { decryptData } from '@/utils/encryption'
import CookieService from '@/services/app/cookie.service'
import { CheckAuthProvider } from '@/hocs/CheckAuthProvider'
import { getAuthUser } from '@/utils/auth'
import { getPermissions } from '@/utils/role_permission'

const Layout = async ({ children }: ReactNode) => {
  const user = await getAuthUser()
  const permissions = await getPermissions()

  return (
    <CheckAuthProvider>
      <section className='flex min-h-screen relative overflow-hidden h-screen'>
        <aside className='w-[260px]'>
          <Sidebar user={user} permissions={permissions} />
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
