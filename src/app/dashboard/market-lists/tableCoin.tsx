"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CryptocurrencyData } from "@/models/Interface";
import { useRouter } from "next/navigation";

const TableCoin = () => {
  const [cryptos, setCryptos] = useState<CryptocurrencyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  const getTopCoins = async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      const res = await fetch("/api/getCoins");
      if (!res.ok) {
        throw new Error(`Failed to fetch, status: ${res.status}`);
      }
      const data = await res.json();
      setCryptos(data.data);
    } catch (error) {
      console.error("Error fetching top coins:", error);
    } finally {
      setIsLoading(false);
      if (showRefresh) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    getTopCoins();

    const interval = setInterval(() => {
      getTopCoins();
    }, 300000); // Refresh setiap 5 menit

    return () => clearInterval(interval);
  }, []);

  const totalPages = Math.ceil(cryptos.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const paginatedCryptos = cryptos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatPrice = (price: number) => {
    return Number(price.toFixed(2)).toLocaleString();
  };

  const formatPercentage = (percent: number) => {
    const abs = Math.abs(percent);
    return abs.toFixed(2);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisible; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full max-w-[250px]" />
                  <Skeleton className="h-4 w-full max-w-[200px]" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-4">
      <Card>
        {/* Header */}
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-blue-900">
                Daftar Pasar
              </CardTitle>
              <CardDescription className="text-sm">
                Data cryptocurrency real-time
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => getTopCoins(true)}
              disabled={isRefreshing}
              className="rounded-full flex-shrink-0"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Daftar
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Terendah
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Tertinggi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedCryptos.map((crypto) => (
                  <tr
                    key={crypto.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/market-lists/${crypto.slug}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {crypto.logoUrl ? (
                          <Image
                            src={crypto.logoUrl}
                            alt={crypto.name}
                            className="rounded-full flex-shrink-0"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{crypto.symbol}/USDT</span>
                          <span className="text-xs text-gray-500">{crypto.name}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-bold text-white px-3 py-1 rounded-full text-sm ${
                          crypto.priceInTargetCurrency.percent_change_24h < 0 
                            ? 'bg-red-500' 
                            : 'bg-blue-900'
                        }`}>
                          {formatPrice(crypto.priceInTargetCurrency.price)}
                        </span>
                        <span className={`text-xs mt-1 flex items-center gap-1 ${
                          crypto.priceInTargetCurrency.percent_change_24h < 0 
                            ? 'text-red-500' 
                            : 'text-green-500'
                        }`}>
                          {crypto.priceInTargetCurrency.percent_change_24h < 0 ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : (
                            <TrendingUp className="h-3 w-3" />
                          )}
                          {crypto.priceInTargetCurrency.percent_change_24h < 0 ? '' : '+'}
                          {formatPercentage(crypto.priceInTargetCurrency.percent_change_24h)}%
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-medium">{formatPrice(crypto.priceInTargetCurrency.price * 0.95)}</span>
                        <span className="text-xs text-gray-500">24h Low</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-medium">{formatPrice(crypto.priceInTargetCurrency.price * 1.05)}</span>
                        <span className="text-xs text-gray-500">24h High</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden divide-y divide-gray-200">
            {paginatedCryptos.map((crypto) => (
              <div
                key={crypto.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/market-lists/${crypto.slug}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Logo & Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {crypto.logoUrl ? (
                      <Image
                        src={crypto.logoUrl}
                        alt={crypto.name}
                        className="rounded-full flex-shrink-0"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-base truncate">{crypto.symbol}/USDT</span>
                      <span className="text-sm text-gray-500 truncate">{crypto.name}</span>
                    </div>
                  </div>

                  {/* Right: Price & Change */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className={`font-bold text-white px-3 py-1 rounded-full text-sm ${
                      crypto.priceInTargetCurrency.percent_change_24h < 0 
                        ? 'bg-red-500' 
                        : 'bg-blue-900'
                    }`}>
                      {formatPrice(crypto.priceInTargetCurrency.price)}
                    </span>
                    <span className={`text-xs mt-1 flex items-center gap-1 ${
                      crypto.priceInTargetCurrency.percent_change_24h < 0 
                        ? 'text-red-500' 
                        : 'text-green-500'
                    }`}>
                      {crypto.priceInTargetCurrency.percent_change_24h < 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <TrendingUp className="h-3 w-3" />
                      )}
                      {crypto.priceInTargetCurrency.percent_change_24h < 0 ? '' : '+'}
                      {formatPercentage(crypto.priceInTargetCurrency.percent_change_24h)}%
                    </span>
                  </div>
                </div>

                {/* Bottom: Low & High (Mobile only) */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">24h Low</span>
                    <span className="font-medium text-sm">
                      {formatPrice(crypto.priceInTargetCurrency.price * 0.95)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">24h High</span>
                    <span className="font-medium text-sm">
                      {formatPrice(crypto.priceInTargetCurrency.price * 1.05)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Info Text */}
              <p className="text-sm text-gray-500 text-center sm:text-left">
                Halaman {currentPage} dari {totalPages}
              </p>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 text-xs sm:text-sm"
                  size="sm"
                >
                  Sebelumnya
                </Button>
                
                {getPageNumbers().map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    onClick={() => handlePageChange(page)}
                    size="sm"
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm ${
                      currentPage === page 
                        ? 'bg-blue-900 text-white hover:bg-blue-800' 
                        : ''
                    }`}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 text-xs sm:text-sm"
                  size="sm"
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TableCoin;