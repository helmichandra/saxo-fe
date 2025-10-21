"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { TrendingDown, TrendingUp, RefreshCw, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CryptocurrencyData } from "@/models/Interface";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BottomNavigation } from "@/components/dashboard/user-view/BottomNavigation";
import { sessionId } from "@/lib/getSession";
import BuyCoin from "./buyCoin";
import { Toaster } from "@/components/ui/toaster";

/* ---------- helpers ---------- */
const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    Math.round(n || 0)
  );

// safe parse string/number -> number
const toNum = (v: unknown) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const f = parseFloat(v);
    return Number.isFinite(f) ? f : 0;
  }
  return 0;
};
const pctColor = (v: unknown) => (toNum(v) < 0 ? "text-red-500" : "text-green-500");

/* ---------- component ---------- */
export default function CoinDetailPage() {
  const params = useParams() as { slug: string };
  const slug = params.slug;

  const router = useRouter();

  const [crypto, setCrypto] = useState<CryptocurrencyData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCrypto = async () => {
    // kalau tidak ada sessionId, jangan ngegantung di loading
    if (!sessionId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/getSingleCoins?slug=${slug}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);
      const data = await res.json();
      const fetched = data.data && data.data[0] ? data.data[0] : data.data;
      setCrypto(fetched);
    } catch (err) {
      console.error("Error fetching crypto:", err);
      setCrypto(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchCrypto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  /* ---------- loading skeleton (tidak ada hook setelah ini) ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <div className="max-w-6xl mx-auto w-full p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!crypto) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-neutral-500">
        Data tidak ditemukan
        <Button className="mt-4" onClick={() => router.push("/dashboard/market-lists")}>
          Kembali
        </Button>
      </div>
    );
  }

  const p = crypto.priceInTargetCurrency;

  // Koersi angka
  const pc24 = toNum(p.percent_change_24h);
  const pc7  = toNum(p.percent_change_7d);
  const pc30 = toNum(p.percent_change_30d);
  const pc60 = toNum(p.percent_change_60d);
  const pc90 = toNum(p.percent_change_90d);

  const chartData = [
    { time: "90 Hari", desktop: pc90 },
    { time: "60 Hari", desktop: pc60 },
    { time: "30 Hari", desktop: pc30 },
    { time: "7 Hari",  desktop: pc7  },
    { time: "24 Jam",  desktop: pc24 },
  ];

  const chartConfig = {
    desktop: { label: "Percent", color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Toaster />

      {/* header */}
      <div className="max-w-6xl mx-auto w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src={crypto.logoUrl} alt={crypto.name} width={48} height={48} className="rounded-full" />
            <div>
              <p className="text-xl font-bold">{crypto.symbol}/USDT</p>
              <p className="text-sm text-gray-500">{crypto.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchCrypto}>
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>

        {/* harga utama */}
        <div>
          <p className="text-3xl font-extrabold text-blue-900">{formatIDR(p.price)}</p>
          <p className={`flex items-center gap-1 text-sm ${pctColor(pc24)}`}>
            {pc24 >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {pc24 >= 0 ? "+" : ""}
            {pc24.toFixed(2)}% (24 jam)
          </p>
        </div>

        {/* grid data */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 border rounded-lg">
            <p className="text-gray-500 text-xs">24h Low</p>
            <p className="font-semibold">{formatIDR((p as any).low_24h ?? p.price * 0.95)}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-gray-500 text-xs">24h High</p>
            <p className="font-semibold">{formatIDR((p as any).high_24h ?? p.price * 1.05)}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-gray-500 text-xs">Market Cap</p>
            <p className="font-semibold">{formatIDR(p.market_cap)}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-gray-500 text-xs">Circulating Supply</p>
            <p className="font-semibold">
              {crypto.circulating_supply.toLocaleString("id-ID")} {crypto.symbol}
            </p>
          </div>
        </div>
      </div>

      {/* chart */}
      <div className="max-w-6xl mx-auto w-full px-6">
        <Card>
          <CardHeader>
            <CardTitle>Performa {crypto.symbol}</CardTitle>
            <CardDescription>Perubahan harga 24 jam - 90 hari</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart data={chartData} margin={{ top: 0, left: 0, right: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => (v as string).slice(0, 3)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickCount={5}
                  padding={{ top: 20 }}
                  tickFormatter={(value) => Number(value).toFixed(2)}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Area dataKey="desktop" type="monotone" fill="#3861fb" fillOpacity={0.2} stroke="#3861fb" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <div className="text-sm font-semibold flex items-center gap-2">
              {pc30 >= 0 ? (
                <>
                  Naik {pc30.toFixed(2)}% bulan ini
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </>
              ) : (
                <>
                  Turun {Math.abs(pc30).toFixed(2)}% bulan ini
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* tombol beli */}
      <div className="max-w-6xl mx-auto w-full px-6 py-8 flex justify-center">
        <BuyCoin {...crypto} />
      </div>

      <BottomNavigation />
    </div>
  );
}
