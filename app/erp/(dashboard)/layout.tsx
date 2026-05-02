import Header from '@/components/erp/common/Header'
import Sidebar from '@/components/erp/common/menus/sidebar'
import { ReactNode } from '@/types'
import { getAuthUser } from '@/utils/auth'
import { getPermissions } from '@/utils/role-permission'
import { DashboardClientWrapper } from '@/hocs/DashboardClientWrapper'
import { SidebarProvider } from '@/components/erp/common/menus/sidebar/sidebarContext'

const Layout = async ({ children }: ReactNode) => {
  const user = await getAuthUser()
  const permissions = await getPermissions()

  return (
    <DashboardClientWrapper>
      <SidebarProvider>
        <section className='flex min-h-screen relative overflow-hidden h-screen'>
          <Sidebar user={user} permissions={permissions} />
          <section className='flex-1 w-full xl:w-[calc(100%-260px)] flex flex-col '>
            <Header />
            <main className='flex-1 overflow-y-auto p-4 md:p-6'>{children}</main>
          </section>
        </section>
      </SidebarProvider>
    </DashboardClientWrapper>
  )
}

export default Layout
