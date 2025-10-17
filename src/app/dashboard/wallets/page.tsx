import AdminAuth from '@/app/layouts/adminAuth'
import React from 'react'
import WalletsUserTable from './walletUserTable'
import FiatsUserTable from './fiatUserTable'

const WalletsPage = () => {
  return (
    <AdminAuth>
        <WalletsUserTable />
        <FiatsUserTable />
    </AdminAuth>
  )
}

export default WalletsPage