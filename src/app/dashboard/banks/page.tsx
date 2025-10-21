"use client"
import AdminAuth from '@/app/layouts/adminAuth'
import TableBanks from './tableBanks'
import TableUserBanks from './tableUserBanks'
import { BottomNavigation } from "@/components/dashboard/user-view/BottomNavigation";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from 'react'
import { getCookie } from '@/lib/auth'
import { roleId } from '@/lib/getSession'

const BanksPage = () => {

  const [currentRoleId, setCurrentRoleId] = useState("");

  useEffect(() => {
    const roleId = getCookie("roleId");
    setCurrentRoleId(roleId || "");
  }, []);
  if (roleId === "1") {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="container mx-auto p-4 max-w-6xl">

            <Card>            
              <TableUserBanks />
            </Card>
        </div>
        <BottomNavigation />
      </div>
    )

  }else{
    
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

}

export default BanksPage