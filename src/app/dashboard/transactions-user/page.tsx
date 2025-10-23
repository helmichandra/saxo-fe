"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense, useMemo } from "react";
import FiatTable from "@/components/dashboard/user-view/transactions/fiatTable";
import WalletTable from "@/components/dashboard/user-view/transactions/walletTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownToLine, ArrowUpFromLine, Coins } from "lucide-react";
import { BottomNavigation } from "@/components/dashboard/user-view/BottomNavigation";

function TransactionsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ✅ Tambahkan fallback agar tidak null
  const params = useMemo(() => new URLSearchParams(searchParams?.toString() ?? ""), [searchParams]);
  const type = useMemo(() => {
    const t = params.get("type");
    return t === "withdraw" || t === "crypto" ? t : "deposit";
  }, [params]);

  const handleTabChange = (val: string) => {
    const newParams = new URLSearchParams(params);
    newParams.set("type", val);
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Riwayat Transaksi</h1>
          <p className="text-muted-foreground mt-1">
            Lihat semua transaksi deposit, withdraw, dan crypto Anda
          </p>
        </div>

        <Tabs value={type} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
              <ArrowUpFromLine className="w-4 h-4" />
              Withdraw
            </TabsTrigger>
            <TabsTrigger value="crypto" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Crypto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4">
            <FiatTable />
          </TabsContent>
          <TabsContent value="withdraw" className="space-y-4">
            <FiatTable />
          </TabsContent>
          <TabsContent value="crypto" className="space-y-4">
            <WalletTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background pb-24">
          <div className="container mx-auto p-4 max-w-6xl">
            <div className="mb-6 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-12 w-full mb-6" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      }
    >
      <TransactionsContent />
      <BottomNavigation />
    </Suspense>
  );
}
