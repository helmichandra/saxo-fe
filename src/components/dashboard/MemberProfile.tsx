"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
  ArrowRight,
  Wallet,
  FileText,
  DollarSign,
  LogOut,
  Home,
  RefreshCw,
  User,
} from "lucide-react";

import { getCookie, logout } from "@/lib/auth";

interface WalletBalance {
  balance: number;
  userId: string;
  fullName: string;
  creditScore: number;
  vipLevel: number;
}

export default function MemberProfile() {
  const router = useRouter();

  const [walletData, setWalletData] =
    useState<WalletBalance | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchWalletBalance = async () => {
    try {
      const sessionId = getCookie("sessionId");

      const fullName = getCookie("fullName");

      if (!sessionId) {
        logout();
        router.push("/auth/signin");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/fiat/balance/getWalletBalance`,
        {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            dev_chronome: "yes",
            authorization: sessionId,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed fetch wallet");
      }

      const data = await response.json();

      setWalletData({
        balance: Number(data.balance || 0),
        userId: data.userId || "N/A",
        fullName:
          fullName ||
          data.fullName ||
          "Unknown User",
        creditScore: Number(data.creditScore || 100),
        vipLevel: Number(data.vipLevel || 1),
      });
    } catch (error) {
      console.error(
        "Error fetching wallet balance:",
        error
      );

      setWalletData({
        balance: 0,
        userId: "N/A",
        fullName:
          getCookie("fullName") ||
          "Unknown User",
        creditScore: 100,
        vipLevel: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/auth/signin");
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(balance);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">
          Memuat...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white pb-24">
      <div className="p-6">
        {/* PROFILE */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-teal-500 shadow-lg">
            <div className="text-3xl font-bold text-slate-900">
              ∞
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-1">
              {walletData?.fullName}
            </h2>

            <p className="text-slate-300 text-sm mb-1">
              Saldo:
              <span className="font-semibold ml-1">
                {formatBalance(
                  walletData?.balance || 0
                )}
              </span>
            </p>

            <p className="text-slate-400 text-sm mb-2">
              ID: {walletData?.userId}
            </p>

            <p className="text-slate-300 text-sm mb-2">
              Skor kredit:
              <span className="font-semibold ml-1">
                {walletData?.creditScore}
              </span>
            </p>

            <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full w-fit">
              <span className="text-teal-400">
                💎
              </span>

              <span className="text-sm font-medium">
                VIP {walletData?.vipLevel}
              </span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() =>
              router.push(
                "/dashboard/requests?type=deposit"
              )
            }
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <Wallet className="w-5 h-5" />
            Isi Ulang
          </button>

          <button
            onClick={() =>
              router.push(
                "/dashboard/requests?type=withdraw"
              )
            }
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <DollarSign className="w-5 h-5" />
            Tarik Dana
          </button>
        </div>

        {/* MENU */}
        <div className="space-y-3">
          {[
            {
              title: "Catatan Penarikan",
              url: "/dashboard/transactions?type=withdraw",
            },
            {
              title: "Catatan Isi Ulang",
              url: "/dashboard/transactions?type=deposit",
            },
            {
              title: "Metode Pembayaran",
              url: "/dashboard/banks",
            },
          ].map((item, index) => (
            <button
              key={index}
              onClick={() =>
                router.push(item.url)
              }
              className="w-full bg-slate-700/50 hover:bg-slate-700 p-4 rounded-2xl flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-teal-400" />
                </div>

                <span className="font-medium">
                  {item.title}
                </span>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-400" />
            </button>
          ))}

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="w-full bg-slate-700/50 hover:bg-slate-700 p-4 rounded-2xl flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>

              <span className="font-medium">
                Keluar
              </span>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 px-6 py-4 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() =>
              router.push("/dashboard/markets")
            }
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">
              Pasar
            </span>
          </button>

          <button
            onClick={() =>
              router.push(
                "/dashboard/transactions"
              )
            }
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-6 h-6" />
            <span className="text-xs">
              Transaksi
            </span>
          </button>

          <button className="flex flex-col items-center gap-1 text-teal-400">
            <User className="w-6 h-6" />
            <span className="text-xs font-semibold">
              Saya
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}