"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie, logout } from "@/lib/auth";
import { ArrowRight, Wallet, FileText, DollarSign, LogOut, Home, RefreshCw, User } from "lucide-react";

interface WalletBalance {
  balance: number;
  userId: string;
  fullName: string;
  creditScore: number;
  vipLevel: number;
}

export default function MemberProfile() {
  const router = useRouter();
  const [walletData, setWalletData] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const sessionId = getCookie("sessionId");
        const fullName = getCookie("fullName");

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

        if (response.ok) {
          const data = await response.json();
          setWalletData({
            ...data,
            fullName: fullName || data.fullName || "Nnn12",
            creditScore: data.creditScore || 100,
            vipLevel: data.vipLevel || 1,
          });
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        // Set default data jika error
        setWalletData({
          balance: 0,
          userId: "N/A",
          fullName: getCookie("fullName") || "Nnn12",
          creditScore: 100,
          vipLevel: 1,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWalletBalance();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/auth/signin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white pb-24">
      {/* Header dengan Profile */}
      <div className="p-6">
        <div className="flex items-start gap-4 mb-8">
          {/* Avatar/Logo */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-teal-500 shadow-lg">
            <div className="text-3xl font-bold text-slate-900">∞</div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-1">
              {walletData?.fullName}
            </h2>
            <p className="text-slate-300 text-sm mb-1">
              Saldo: <span className="font-semibold">{walletData?.balance?.toFixed(2)}</span>
            </p>
            <p className="text-slate-400 text-sm mb-2">
              ID: {walletData?.userId}
            </p>
            <p className="text-slate-300 text-sm mb-2">
              Skor kredit: <span className="font-semibold">{walletData?.creditScore}</span>
            </p>
            <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full w-fit">
              <span className="text-teal-400">💎</span>
              <span className="text-sm font-medium">VIP {walletData?.vipLevel}</span>
            </div>
          </div>

          {/* Chat Icon */}
          <button className="p-2 bg-teal-500/20 rounded-lg hover:bg-teal-500/30 transition-colors">
            <svg
              className="w-6 h-6 text-teal-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => router.push("/dashboard/requests?type=deposit")}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
          >
            <Wallet className="w-5 h-5" />
            <span>Isi Ulang</span>
          </button>
          <button
            onClick={() => router.push("/dashboard/requests?type=withdraw")}
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
          >
            <DollarSign className="w-5 h-5" />
            <span>Tarik Dana</span>
          </button>
        </div>

        {/* Menu List */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/dashboard/transactions?type=withdraw")}
            className="w-full bg-slate-700/50 hover:bg-slate-700 p-4 rounded-2xl flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-400" />
              </div>
              <span className="font-medium">Catatan Penarikan</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </button>

          <button
            onClick={() => router.push("/dashboard/transactions?type=deposit")}
            className="w-full bg-slate-700/50 hover:bg-slate-700 p-4 rounded-2xl flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-400" />
              </div>
              <span className="font-medium">Catatan Isi Ulang</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </button>

          <button
            onClick={() => router.push("/dashboard/banks")}
            className="w-full bg-slate-700/50 hover:bg-slate-700 p-4 rounded-2xl flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-teal-400" />
              </div>
              <span className="font-medium">Metode Pembayaran</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-slate-700/50 hover:bg-slate-700 p-4 rounded-2xl flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <span className="font-medium">Keluar</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 px-6 py-4 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => router.push("/dashboard/markets")}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Pasar</span>
          </button>

          <button
            onClick={() => router.push("/dashboard/transactions")}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-6 h-6" />
            <span className="text-xs">Pesanan Perdagangan</span>
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="flex flex-col items-center gap-1 text-teal-400 transition-colors"
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-semibold">Informasi Saya</span>
          </button>
        </div>
      </div>
    </div>
  );
}