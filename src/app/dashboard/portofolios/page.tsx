import AdminAuth from '@/app/layouts/adminAuth'
import React from 'react'
import PortoTable from './portoTable'

const PortofoliosPage = () => {
  return (
    <AdminAuth>
        <PortoTable />
    </AdminAuth>
  )
}

export default PortofoliosPage