"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/auth";
import { UserProfileHeader } from "@/components/dashboard/user-view/UserProfileHeader";
import { ActionButtons } from "@/components/dashboard/user-view/ActionButtons";
import { MenuList } from "@/components/dashboard/user-view/MenuList";
import { BottomNavigation } from "@/components/dashboard/user-view/BottomNavigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WalletData {
  balance: number;
  userId: string;
  fullName: string;
  creditScore: number;
  vipLevel: number;
}

export default function UserViewPage() {
  const router = useRouter();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const sessionId = getCookie("sessionId");
      const roleId = getCookie("roleId");
      const fullName = getCookie("fullName");

      // Redirect jika bukan member
      if (roleId !== "1") {
        router.push("/dashboard/markets");
        return;
      }

      if (!sessionId) {
        router.push("/auth/signin");
        return;
      }

      // Fetch wallet balance
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
        console.log(data.data);
        setWalletData({
          balance: data.data.balance || 0,
          userId: data.data.userId || "N/A",
          fullName: fullName || data.data.fullName || "User",
          creditScore: data.data.creditScore || 100,
          vipLevel: data.data.vipLevel || 1,
        });
      } else {
        // Set default data jika API gagal
        setWalletData({
          balance: 0,
          userId: "N/A",
          fullName: fullName || "User",
          creditScore: 100,
          vipLevel: 1,
        });
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      // Set default data jika error
      const fullName = getCookie("fullName");
      setWalletData({
        balance: 0,
        userId: "N/A",
        fullName: fullName || "User",
        creditScore: 100,
        vipLevel: 1,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="container mx-auto p-4 max-w-6xl">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>

          {/* Profile Card Skeleton */}
          <Card className="p-6 mb-6">
            <div className="flex items-start gap-4">
              <Skeleton className="w-20 h-20 rounded-full shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-4 mt-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons Skeleton */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>

          {/* Menu List Skeleton */}
          <Card className="p-4">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="w-5 h-5 rounded" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Selamat datang, {walletData?.fullName}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="p-6 mb-6 hover:shadow-lg transition-shadow">
          <UserProfileHeader walletData={walletData} />
        </Card>

        {/* Action Buttons */}
        <div className="mb-6">
          <ActionButtons />
        </div>

        {/* Menu List */}
        <Card className="p-4">
          <MenuList />
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}