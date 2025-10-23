import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { logout } from "@/lib/auth";
import { sessionId } from "@/lib/getSession";
import React, { useEffect, useState } from "react";

interface WalletData {
  balance: number;
  userId: string;
  fullName: string;
  creditScore: number;
  vipLevel: number;
}

interface UserProfileHeaderProps {
  walletData: WalletData | null;
}

export function UserProfileHeader({ walletData }: UserProfileHeaderProps) {
  const [fiatBalance, setFiatBalance] = useState<number | null>(null);
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const fetchFiatBalance = async () => {
      if (!sessionId) {
        console.warn("Session ID is missing. Cannot fetch balance.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
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
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch balance: ${response.status}`);
        }

        const data = await response.json();
        setFiatBalance(data.data?.balance || 0);
        setCreditScore(data.data.user?.creditScore || 0);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setFiatBalance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFiatBalance();
  }, []);

  return (
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <Avatar className="w-20 h-20 border-2 border-primary shadow-md shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-2xl font-bold">
          {walletData?.fullName ? getInitials(walletData.fullName) : "∞"}
        </AvatarFallback>
      </Avatar>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-semibold mb-2 truncate">
          {walletData?.fullName || "User"}
        </h2>

        <div className="space-y-2 mb-3">
          {/* Balance */}
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">Saldo:</span>
            {loading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span className="font-mono font-semibold text-base">
                {fiatBalance !== null
                  ? Number(fiatBalance).toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 2,
                    })
                  : "Rp 0,00"}
              </span>
            )}
          </div>

          {/* User ID */}
          <p className="text-sm text-muted-foreground">
            ID: <span className="font-medium">{walletData?.userId || "N/A"}</span>
          </p>

          {/* Credit Score */}
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">Credit Score:</span>
            <span className="font-semibold text-sm">
              {creditScore}
            </span>
          </div>
        </div>

        {/* VIP Badge */}
        <Badge variant="secondary" className="font-medium">
          <span className="mr-1.5">💎</span>
          VIP {walletData?.vipLevel || 1}
        </Badge>
      </div>

      {/* Chat Button */}
      <Button
        size="icon"
        variant="outline"
        className="shrink-0 hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
      </Button>
    </div>
  );
}