import React from "react";
import FiatTable from "./fiatTable";
import WalletTable from "./walletTable";
import AdminAuth from "@/app/layouts/adminAuth";

const TransactionPage = () => {
  return (
    <AdminAuth>
      <div>
        <h1 className="text-2xl font-bold pb-10 pt-3">Riwayat Transaksi</h1>
        <FiatTable />
        <WalletTable />
      </div>
    </AdminAuth>
  );
};

export default TransactionPage;
