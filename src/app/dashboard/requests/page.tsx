import React from "react";
import DepositRequestTable from "./requestsTable";
import AdminAuth from "@/app/layouts/adminAuth";

const DepositsPages = () => {
  return (
    <AdminAuth>
      <DepositRequestTable />
    </AdminAuth>
  );
};

export default DepositsPages;
