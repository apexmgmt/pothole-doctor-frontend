import Header from '@/components/erp/common/Header'
import Sidebar from '@/components/erp/common/menus/Sidebar'
import { ReactNode } from '@/types'


const Layout = ({ children }: ReactNode) => {
  return (
    <section className='flex min-h-screen relative overflow-hidden h-screen'>
      <aside className='w-[260px]'>
        <Sidebar />
      </aside>
      <section className='w-[calc(100%-260px)] flex flex-col'>
        <Header />
        <main className='flex-1 overflow-y-auto p-6'>{children}</main>
      </section>
    </section>
  )
}

export default Layout
