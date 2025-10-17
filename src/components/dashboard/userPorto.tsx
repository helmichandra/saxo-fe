"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CryptoWallet } from "@/models/Interface";
import { sessionId } from "@/lib/getSession";
import { logout } from "@/lib/auth";

const UserPorto = () => {
  const [portos, setPortos] = useState<CryptoWallet[]>([]);

  useEffect(() => {
    const fetchPortos = async () => {
      if(!sessionId){
        return;
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trade/coinwallet/getBalances`, {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            dev_chronome: "yes",
            authorization: `${sessionId}`,
          },
        });

        if (response.status === 401) {
          console.warn("Unauthorized. Redirecting...");
          logout();
          return;
        }

        const data = await response.json();
        if (!response.ok) {
          throw new Error("Failed to fetch portfolio");
        }

        setPortos(data.data);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      }
    };
    setTimeout(() => {
      fetchPortos();
    }, 5000)
  }, []);

  return (
    <div className="max-w-full md:max-w-[605px] w-full bg-[#0F172A] rounded-xl">
      <div className="py-[24px] px-[22px] bg-[#0F172A] rounded-xl">
        <div className="text-white flex justify-between">
          <div className="font-bold text-md">Portofolio Saya</div>
          <Link href="/dashboard/portofolios" className="text-sm flex items-center gap-1">
            Lebih Lanjut
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
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
          {portos.length > 0 ? (
            portos.slice(0, 4).map((porto) => (
              <div
                key={porto.cryptoWalletId}
                className="flex justify-between text-white py-2"
              >
                <div className="text-sm font-bold">
                  {porto.cryptocurrencyType.coinName} (
                  {porto.cryptocurrencyType.coinCode})
                </div>
                <div className="text-sm">{porto.balance}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400">Mengambil data porto...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPorto;
