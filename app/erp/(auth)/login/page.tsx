import React from 'react'

import Login from '@/views/erp/auth/login/Login'
import { isTenant } from '@/utils/utility'
export const dynamic = 'force-dynamic'

const LoginPage = async () => {
  const isTenantDomain: boolean = await isTenant()

  return <Login isTenant={isTenantDomain} />
}

export default LoginPage
