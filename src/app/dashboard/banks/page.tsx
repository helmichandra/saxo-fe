"use client"
import AdminAuth from '@/app/layouts/adminAuth'
import TableBanks from './tableBanks'
import TableUserBanks from './tableUserBanks'

import { useEffect, useState } from 'react'
import { getCookie } from '@/lib/auth'

const BanksPage = () => {

  const [currentRoleId, setCurrentRoleId] = useState("");

  useEffect(() => {
    const roleId = getCookie("roleId");
    setCurrentRoleId(roleId || "");
  }, []);

  return (
    <AdminAuth>
      {(currentRoleId === "777" || currentRoleId === "555") ? (
        <TableBanks />
      ) : (
        <TableUserBanks />
      )}
    </AdminAuth>
  )
}

export default BanksPage