"use client";

import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

import AdminAuth from "@/app/layouts/adminAuth";

import { CryptocurrencyData } from "@/models/Interface";

import { TrendingDown, TrendingUp } from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import BuyCoin from "./buyCoin";

import { Toaster } from "@/components/ui/toaster";

import { sessionId } from "@/lib/getSession";

const CoinDetailPage = () => {
  const router = useRouter();

  const { slug } = router.query;

  const [crypto, setCrypto] =
    useState<CryptocurrencyData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug || typeof slug !== "string") {
      return;
    }

    const fetchCrypto = async () => {
      if (!sessionId) {
        setError("Session tidak ditemukan");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/getSingleCoins?slug=${slug}`
        );

        if (!res.ok) {
          throw new Error(
            `Failed to fetch data: ${res.status}`
          );
        }

        const data = await res.json();

        const fetchedData =
          data.data && data.data[0]
            ? data.data[0]
            : data.data;

        setCrypto(fetchedData);
      } catch (error) {
        console.error(
          "Error fetching crypto data:",
          error
        );

        setError("Failed to load crypto details");
      } finally {
        setLoading(false);
      }
    };

    fetchCrypto();
  }, [slug]);

  const chartData = [
    {
      time: "90 Hari",
      desktop:
        crypto?.priceInTargetCurrency
          ?.percent_change_90d || 0,
    },
    {
      time: "60 Hari",
      desktop:
        crypto?.priceInTargetCurrency
          ?.percent_change_60d || 0,
    },
    {
      time: "30 Hari",
      desktop:
        crypto?.priceInTargetCurrency
          ?.percent_change_30d || 0,
    },
    {
      time: "7 Hari",
      desktop:
        crypto?.priceInTargetCurrency
          ?.percent_change_7d || 0,
    },
    {
      time: "24 Jam",
      desktop:
        crypto?.priceInTargetCurrency
          ?.percent_change_24h || 0,
    },
  ];

  const chartConfig: ChartConfig = {
    desktop: {
      label: "Percent",
      color: "hsl(var(--chart-1))",
    },
  };

  if (loading) {
    return (
      <AdminAuth>
        <p className="p-4">Loading...</p>
      </AdminAuth>
    );
  }

  if (error) {
    return (
      <AdminAuth>
        <p className="p-4 text-red-500">{error}</p>
      </AdminAuth>
    );
  }

  if (!crypto) {
    return (
      <AdminAuth>
        <p className="p-4">404 - Coin not found</p>
      </AdminAuth>
    );
  }

  return (
    <AdminAuth>
      <Toaster />

      <div>
        <div className="flex-1 flex gap-4 p-4 flex-col md:flex-row">
          <div className="flex-1 p-4 flex-row flex items-center gap-4">
            <div className="flex items-center gap-4">
              <Image
                src={crypto.logoUrl}
                alt={crypto.name}
                width={34}
                height={34}
                className="object-contain pt-5"
              />

              <div>
                <span className="text-sm font-bold text-gray-500">
                  Ranking #{crypto.cmc_rank}
                </span>

                <div className="text-3xl font-bold">
                  {crypto.name}
                </div>
              </div>
            </div>

            <span className="px-2 bg-gray-200 text-gray-500 rounded text-sm">
              {crypto.symbol}
            </span>
          </div>

          <div className="flex-1 p-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 font-bold">
                {crypto.name} Harga (
                {crypto.symbol})
              </span>

              <div className="text-2xl font-bold">
                Rp
                {Number(
                  crypto.priceInTargetCurrency.price.toFixed(
                    2
                  )
                ).toLocaleString()}
              </div>

              <div className="flex gap-5">
                <div>
                  <span className="text-xs font-bold">
                    24 Jam %
                  </span>

                  <p
                    className={
                      crypto.priceInTargetCurrency
                        .percent_change_24h < 0
                        ? "text-red-500 font-bold text-sm flex items-center gap-2"
                        : "text-green-500 font-bold text-sm flex items-center gap-2"
                    }
                  >
                    {crypto.priceInTargetCurrency
                      .percent_change_24h < 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}

                    {
                      crypto.priceInTargetCurrency
                        .percent_change_24h
                    }
                    %
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold">
                    7 Hari %
                  </span>

                  <p
                    className={
                      crypto.priceInTargetCurrency
                        .percent_change_7d < 0
                        ? "text-red-500 font-bold text-sm flex items-center gap-2"
                        : "text-green-500 font-bold text-sm flex items-center gap-2"
                    }
                  >
                    {crypto.priceInTargetCurrency
                      .percent_change_7d < 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}

                    {
                      crypto.priceInTargetCurrency
                        .percent_change_7d
                    }
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4">
            <div className="flex-row flex gap-3">
              <BuyCoin {...crypto} />
            </div>
          </div>
        </div>

        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {crypto.name} ke{" "}
                {crypto.targetCurrency}
              </CardTitle>

              <CardDescription>
                Performa harga {crypto.name}
              </CardDescription>
            </CardHeader>

            <CardContent className="h-[300px]">
              <ChartContainer
                config={chartConfig}
                className="h-full w-full"
              >
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    top: 0,
                    left: 0,
                    right: 0,
                  }}
                >
                  <CartesianGrid vertical={false} />

                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                  />

                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent indicator="line" />
                    }
                  />

                  <Area
                    dataKey="desktop"
                    type="monotone"
                    fill="#3861fb"
                    fillOpacity={0.2}
                    stroke="#3861fb"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>

            <CardFooter>
              <div className="flex w-full items-start gap-2 text-sm">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 leading-none font-bold">
                    {crypto.priceInTargetCurrency
                      .percent_change_30d > 0 ? (
                      <>
                        Naik ke{" "}
                        {
                          crypto.priceInTargetCurrency
                            .percent_change_30d
                        }
                        % bulan ini

                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </>
                    ) : (
                      <>
                        Turun ke{" "}
                        {
                          crypto.priceInTargetCurrency
                            .percent_change_30d
                        }
                        % bulan ini

                        <TrendingDown className="h-4 w-4 text-red-500" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="p-4 flex flex-wrap gap-2">
          {crypto.infoCoin?.website?.map(
            (url: string, index: number) => (
              <DropdownMenu key={index}>
                <DropdownMenuTrigger className="border bg-gray-200 px-3 py-1 rounded text-black font-bold text-xs">
                  Website
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="text-xs">
                    <Link
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {url}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          )}
        </div>
      </div>
    </AdminAuth>
  );
};

export default CoinDetailPage;
