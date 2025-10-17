"use client";
import { logout } from "@/lib/auth";
import { sessionId } from "@/lib/getSession";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const ShowBalance = () => {
  const [fiatBalance, setFiatBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchFiatBalance = async () => {
      if (!sessionId) {
        console.warn("Session ID is missing. Cannot fetch balance.");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/fiat/balance/getWalletBalance`,
          {
            method: "POST",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
              dev_chronome: "yes",
              authorization: `${sessionId}`,
            },
          }
        );

        if (response.status === 401) {
          console.warn("Unauthorized. Redirecting...");
          logout();
          return;
        }

        if (response.status === 500) {
          console.error("Internal server error. Stopping execution.");
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch balance: ${response.status}`);
        }

        const data = await response.json();
        setFiatBalance(data.data?.balance || 0);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setFiatBalance(null);
      }
    };

    fetchFiatBalance();
  }, []);

  return (
    <div className="flex flex-col gap-[11px] max-w-full md:max-w-[447px] w-full">
      <div className="py-[24px] px-[22px] bg-[#0F172A] rounded-xl">
        <div className="text-white flex justify-between">
          <div className="font-bold text-md">Saldo Deposit (Fiat)</div>
          <Link href="#" className="text-sm flex items-center gap-1">
            Lihat Transaksi
            <span>
              <svg
                xmlns="https://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </Link>
        </div>
        <div className="py-3">
          <span className="text-2xl font-bold text-white">
            {fiatBalance !== null ? (
              `${Number(fiatBalance).toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 2,
              })}`
            ) : (
              <div className="text-sm text-gray-400">Mengambil data saldo...</div>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShowBalance;
