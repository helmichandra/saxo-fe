"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { BottomNavigation } from "@/components/dashboard/user-view/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number;
}

export default function MarketListPage() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCryptoData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false&locale=en"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setCryptoData(data);
      setError(null);
    } catch (err) {
      setError("Gagal memuat data cryptocurrency");
      console.error("Error fetching crypto data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1000) {
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    return formatNumber(num);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Daftar Pasar</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Data cryptocurrency real-time
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchCryptoData(true)}
            disabled={refreshing}
            className="shrink-0"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Error State */}
        {error && !loading && (
          <Card className="p-6 mb-4 border-destructive">
            <p className="text-destructive text-center">{error}</p>
          </Card>
        )}

        {/* Loading Skeleton */}
        {loading && cryptoData.length === 0 ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Daftar</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-right">Terendah</TableHead>
                  <TableHead className="text-right">Tertinggi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(8)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-24 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          /* Data Table */
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Daftar</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">
                    Terendah
                  </TableHead>
                  <TableHead className="text-right hidden sm:table-cell">
                    Tertinggi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cryptoData.map((crypto) => {
                  const isPositive = crypto.price_change_percentage_24h >= 0;

                  return (
                    <TableRow key={crypto.id} className="cursor-pointer">
                      {/* Coin Info */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={crypto.image}
                            alt={crypto.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="font-semibold">
                              {crypto.symbol.toUpperCase()}/USDT
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {crypto.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Current Price */}
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={isPositive ? "default" : "destructive"}
                            className="font-mono text-sm px-3 py-1"
                          >
                            {formatNumber(crypto.current_price)}
                          </Badge>
                          <div
                            className={`flex items-center gap-1 text-xs font-medium ${
                              isPositive
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {isPositive ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {isPositive ? "+" : ""}
                            {crypto.price_change_percentage_24h.toFixed(2)}%
                          </div>
                        </div>
                      </TableCell>

                      {/* Low 24h */}
                      <TableCell className="text-right hidden sm:table-cell">
                        <div className="font-mono text-sm">
                          {formatNumber(crypto.low_24h)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          24h Low
                        </div>
                      </TableCell>

                      {/* High 24h */}
                      <TableCell className="text-right hidden sm:table-cell">
                        <div className="font-mono text-sm">
                          {formatLargeNumber(crypto.high_24h)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          24h High
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Mobile View - Additional Info */}
        <div className="sm:hidden mt-4 space-y-2">
          {!loading &&
            cryptoData.map((crypto) => (
              <Card key={`mobile-${crypto.id}`} className="p-4">
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">24h Terendah</p>
                    <p className="font-mono font-semibold">
                      {formatNumber(crypto.low_24h)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground mb-1">24h Tertinggi</p>
                    <p className="font-mono font-semibold">
                      {formatLargeNumber(crypto.high_24h)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}