import React from 'react'

import { ReactNode } from '@/types'
import Header from '@/components/frontend/common/Header'
import Footer from '@/components/frontend/common/Footer'


// Generate meta data

const Layout = ({ children }: ReactNode) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default Layout
