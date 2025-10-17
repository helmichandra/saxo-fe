import React from "react";
import TableCoin from "@/app/dashboard/markets/tableCoin";
import HeadContent from "@/components/dashboard/headContent";

import AdminAuth from "../layouts/adminAuth";

const Dashboard = () => {
  return (
    <AdminAuth>
      <div>
        <HeadContent />
      </div>
      <TableCoin />
    </AdminAuth>
  );
};

export default Dashboard;
