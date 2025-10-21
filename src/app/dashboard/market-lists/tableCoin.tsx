"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-bold">Daftar Pasar</h2>
            <p className="text-sm text-gray-500">Data cryptocurrency real-time</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => getTopCoins(true)}
            disabled={isRefreshing}
            className="rounded-full"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Daftar</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Harga</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Terendah</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Tertinggi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCryptos.map((crypto, index) => (
                <tr
                    key={crypto.id}
                    className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/market-lists/${crypto.slug}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {crypto.logoUrl ? (
                        <Image
                          src={crypto.logoUrl}
                          alt={crypto.name}
                          className="rounded-full"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200" />
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
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 py-6">
        <Button
          variant="ghost"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4"
        >
          Sebelumnya
        </Button>
        
        {getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "ghost"}
            onClick={() => handlePageChange(page)}
            className={`w-10 h-10 ${
              currentPage === page 
                ? 'bg-white text-black border-2 border-gray-300 hover:bg-gray-100' 
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
          className="px-4"
        >
          Selanjutnya
        </Button>
      </div>
    </>
  );
};

export default TableCoin;