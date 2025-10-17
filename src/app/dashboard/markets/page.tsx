"use client";
import AdminAuth from "@/app/layouts/adminAuth";
import TableCoin from "@/app/dashboard/markets/tableCoin";
import HeadContent from "@/components/dashboard/headContent";
import React from "react";
import { fullName } from "@/lib/getSession";

const CoinsPage = () => {
  return (
    <AdminAuth>
      <div>
        <div className="py-5">
          <span className="font-bold">
            Halo <span className="capitalize">{fullName}</span>,
          </span>
          <h1 className="text-2xl font-bold">
            Harga Crypto dalam Rupiah Hari Ini
          </h1>
        </div>
        <div>
          <HeadContent />
        </div>
        <div>
          <TableCoin />
        </div>
      </div>
    </AdminAuth>
  );
};

export default CoinsPage;
