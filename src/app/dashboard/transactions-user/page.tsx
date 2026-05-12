"use client";

import React, {
  Suspense,
  useMemo,
} from "react";

import {
  useRouter,
} from "next/router";

import FiatTable from "@/components/dashboard/user-view/transactions/fiatTable";

import WalletTable from "@/components/dashboard/user-view/transactions/walletTable";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Skeleton,
} from "@/components/ui/skeleton";

import {
  ArrowUpFromLine,
  Coins,
} from "lucide-react";

import { BottomNavigation } from "@/components/dashboard/user-view/BottomNavigation";

function TransactionsContent() {
  const router = useRouter();

  // ambil query type dari router lama
  const type = useMemo(() => {
    const t = router.query.type;

    return t === "withdraw" ||
      t === "crypto"
      ? t
      : "withdraw";
  }, [router.query.type]);

  const handleTabChange = (
    val: string
  ) => {
    router.replace({
      pathname: router.pathname,
      query: {
        ...router.query,
        type: val,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto p-4 max-w-6xl">

        {/* HEADER */}

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Riwayat Transaksi
          </h1>

          <p className="text-muted-foreground mt-1">
            Lihat semua transaksi
            deposit, withdraw,
            dan crypto Anda
          </p>
        </div>

        {/* TABS */}

        <Tabs
          value={type}
          onValueChange={
            handleTabChange
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">

            <TabsTrigger
              value="withdraw"
              className="flex items-center gap-2"
            >
              <ArrowUpFromLine className="w-4 h-4" />

              Withdraw / Deposit
            </TabsTrigger>

            <TabsTrigger
              value="crypto"
              className="flex items-center gap-2"
            >
              <Coins className="w-4 h-4" />

              Crypto
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="withdraw"
            className="space-y-4"
          >
            <FiatTable />
          </TabsContent>

          <TabsContent
            value="crypto"
            className="space-y-4"
          >
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