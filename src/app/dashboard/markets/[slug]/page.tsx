"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CryptocurrencyData } from "@/models/Interface";
import AdminAuth from "@/app/layouts/adminAuth";
import Image from "next/image";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import Link from "next/link";
import BuyCoin from "./buyCoin";
import { Toaster } from "@/components/ui/toaster";
import { sessionId } from "@/lib/getSession";

const CoinDetailPage = () => {
  const params = useParams();
  const slug = params?.slug;
  const [crypto, setCrypto] = useState<CryptocurrencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slug) {
      const fetchCrypto = async () => {

        if(!sessionId){
          return;
        }

        try {
          const res = await fetch(`/api/getSingleCoins?slug=${slug}`);
          if (!res.ok) {
            throw new Error(`Failed to fetch data: ${res.status}`);
          }
          const data = await res.json();

          const fetchedData =
            data.data && data.data[0] ? data.data[0] : data.data;

          setCrypto(fetchedData);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching crypto data:", error);
          setError("Failed to load crypto details");
          setLoading(false);
        }
      };

      fetchCrypto();
    }
  }, [slug]);

  const chartData = [
    {
      time: "90 Hari",
      desktop: crypto?.priceInTargetCurrency.percent_change_90d || 0,
    },
    {
      time: "60 Hari",
      desktop: crypto?.priceInTargetCurrency.percent_change_60d || 0,
    },
    {
      time: "30 Hari",
      desktop: crypto?.priceInTargetCurrency.percent_change_30d || 0,
    },
    {
      time: "7 Hari",
      desktop: crypto?.priceInTargetCurrency.percent_change_7d || 0,
    },
    {
      time: "24 Jam",
      desktop: crypto?.priceInTargetCurrency.percent_change_24h || 0,
    },
  ];
  const chartConfig = {
    desktop: {
      label: "Percent",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  if (!crypto) {
    return loading ? (
      <AdminAuth>
        <p>Loading...</p>
      </AdminAuth>
    ) : error ? (
      <AdminAuth>
        <p>{error}</p>
      </AdminAuth>
    ) : (
      <p>404 - Coin not found</p>
    );
  }

  return (
    <AdminAuth>
      <Toaster />
      <div className="">
        <div className="flex-1 flex gap-4 p-4 flex-col md:flex-row">
          {/* Wrap */}
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
                <div className="text-3xl font-bold">{crypto.name}</div>
              </div>
            </div>
            <span className="px-2 bg-gray-200 text-gray-500 rounded text-sm">
              {crypto.symbol}
            </span>
          </div>
          <div className="flex-1 p-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 font-bold">
                {crypto.name} Harga ({crypto.symbol})
              </span>
              <div className="text-2xl font-bold">
                Rp
                {Number(
                  crypto.priceInTargetCurrency.price.toFixed(2)
                ).toLocaleString()}
              </div>
              <div className="flex gap-5">
                <div>
                  <span className="text-xs font-bold">24 Jam %</span>
                  <p
                    className={
                      crypto.priceInTargetCurrency.percent_change_24h < 0
                        ? "text-red-500 font-bold text-sm flex items-center gap-2"
                        : "text-green-500 font-bold text-sm flex items-center gap-2"
                    }
                  >
                    {crypto.priceInTargetCurrency.percent_change_24h < 0 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#EA3943"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21l-12-18h24z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#17C784"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 22h-24l12-20z" />
                      </svg>
                    )}
                    {crypto.priceInTargetCurrency.percent_change_24h ?? "N/A"}%
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold">7 Hari %</span>
                  <p
                    className={
                      crypto.priceInTargetCurrency.percent_change_7d < 0
                        ? "text-red-500 font-bold text-sm flex items-center gap-2"
                        : "text-green-500 font-bold text-sm flex items-center gap-2"
                    }
                  >
                    {crypto.priceInTargetCurrency.percent_change_7d < 0 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#EA3943"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21l-12-18h24z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#17C784"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 22h-24l12-20z" />
                      </svg>
                    )}
                    {crypto.priceInTargetCurrency.percent_change_7d}%
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
          {/* Wrap */}
        </div>
        <div className="flex-1 flex gap-4 p-4 flex-col md:flex-row">
          {/* Wrap */}
          <div className="flex-1 p-4 flex-col flex gap-2">
            <span className="text-sm text-gray-500 font-bold">
              Info tentang {crypto.name}
            </span>
            <div className="flex gap-3 flex-wrap">
              {crypto.infoCoin.website.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="border bg-gray-200 px-3 py-1 rounded text-black font-bold text-xs">
                    Website
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuSeparator />
                    {crypto.infoCoin.website.map((url, index) => (
                      <DropdownMenuItem className="text-xs" key={index}>
                        <Link
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {url}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {crypto.infoCoin.technical_doc.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="border bg-gray-200 px-3 py-1 rounded text-black font-bold text-xs">
                    Buku Panduan
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuSeparator />
                    {crypto.infoCoin.technical_doc.map((url, index) => (
                      <DropdownMenuItem className="text-xs" key={index}>
                        <Link
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {url}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {crypto.infoCoin.twitter.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="border bg-gray-200 px-3 py-1 rounded text-black font-bold text-xs">
                    Twitter/ X
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuSeparator />
                    {crypto.infoCoin.twitter.map((url, index) => (
                      <DropdownMenuItem className="text-xs" key={index}>
                        <Link
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {url}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {crypto.infoCoin.message_board.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="border bg-gray-200 px-3 py-1 rounded text-black font-bold text-xs">
                    Papan Pesan
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuSeparator />
                    {crypto.infoCoin.message_board.map((url, index) => (
                      <DropdownMenuItem className="text-xs" key={index}>
                        <Link
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {url}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {crypto.infoCoin.source_code.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="border bg-gray-200 px-3 py-1 rounded text-black font-bold text-xs">
                    Sumber Kode
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuSeparator />
                    {crypto.infoCoin.source_code.map((url, index) => (
                      <DropdownMenuItem className="text-xs" key={index}>
                        <Link
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {url}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {crypto.infoCoin.chat.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="border bg-gray-200 px-3 py-1 rounded text-black font-bold text-xs">
                    Chat
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuSeparator />
                    {crypto.infoCoin.chat.map((url, index) => (
                      <DropdownMenuItem className="text-xs" key={index}>
                        <Link
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {url}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {crypto.infoCoin.announcement.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="border bg-gray-200 px-3 py-1 rounded text-black font-bold text-xs">
                    Pengumuman
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuSeparator />
                    {crypto.infoCoin.announcement.map((url, index) => (
                      <DropdownMenuItem className="text-xs" key={index}>
                        <Link
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {url}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {crypto.infoCoin.reddit.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="border bg-gray-200 px-3 py-1 rounded text-black font-bold text-xs">
                    Reddit
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuSeparator />
                    {crypto.infoCoin.reddit.map((url, index) => (
                      <DropdownMenuItem className="text-xs" key={index}>
                        <Link
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {url}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {crypto.infoCoin.explorer.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="border bg-gray-200 px-3 py-1 rounded text-black font-bold text-xs">
                    Explorer
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuSeparator />
                    {crypto.infoCoin.explorer.map((url, index) => (
                      <DropdownMenuItem className="text-xs" key={index}>
                        <Link
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {url}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <div className="flex-1 p-4 flex gap-5 flex-col md:flex-row">
            <div className="border-s px-5">
              <span className="text-sm text-gray-500 font-bold">
                Kapitalisasi Pasar
              </span>
              <p className="font-bold text-sm">
                Rp
                {Number(
                  crypto.priceInTargetCurrency.market_cap.toFixed(2)
                ).toLocaleString()}
              </p>
            </div>
            <div className="border-s px-5">
              <span className="text-sm text-gray-500 font-bold">
                Kapital Pasar yang Dicairkan Sepenuhnya
              </span>
              <p className="font-bold text-sm">
                Rp
                {Number(
                  crypto.priceInTargetCurrency.fully_diluted_market_cap.toFixed(
                    2
                  )
                ).toLocaleString()}
              </p>
            </div>
            <div className="border-s px-5">
              <span className="text-sm text-gray-500 font-bold">
                Persediaan Beredar
              </span>
              <p className="font-bold text-sm">{crypto.circulating_supply}</p>
            </div>
          </div>

          {/* Wrap */}
        </div>
      </div>

      <div className="p-4 flex-1">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {crypto.name} ke {crypto.targetCurrency}
              </CardTitle>
              <CardDescription>
                {crypto.name} ke {crypto.targetCurrency}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
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
                    tickFormatter={(value) => value.slice(0, 3)}
                  />

                  <YAxis
                    domain={[0, 300]}
                    tickCount={5}
                    tickLine={false}
                    axisLine={false}
                    padding={{ top: 20 }}
                    tickFormatter={(value) => value.toFixed(2)}
                  />

                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
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
                    {crypto.priceInTargetCurrency.percent_change_30d > 0 ? (
                      <>
                        Naik ke {crypto.priceInTargetCurrency.percent_change_30d}%
                        bulan ini
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </>
                    ) : (
                      <>
                        Turun ke{" "}
                        {crypto.priceInTargetCurrency.percent_change_30d}% bulan ini
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AdminAuth>
  );
};

export default CoinDetailPage;
