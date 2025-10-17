"use client";
import AdminAuth from "@/app/layouts/adminAuth";
import React from "react";
import UsersTable from "./usersTable";
import MembersTable from "./membersTable";
import AdminsTable from "./adminsTable";
import { getCookie } from "@/lib/auth";

const UsersManagementPage = () => {

  return (
    <AdminAuth>
      <div>
        <h1 className="text-2xl font-bold pb-10 pt-3">Kelola User</h1>
      </div>

      {getCookie("roleId") !== "555" && <AdminsTable />}
      <UsersTable />
      <MembersTable />
    </AdminAuth>
  );
};

export default UsersManagementPage;
