"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { TrendingUp, TrendingDown, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CryptocurrencyData } from "@/models/Interface";
import { sessionId } from "@/lib/getSession";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/auth";

type TradeType = 'BUY' | 'SELL';

const TableCoin = () => {
  const { toast } = useToast();
  const [cryptos, setCryptos] = useState<CryptocurrencyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptocurrencyData | null>(null);
  const [orderType, setOrderType] = useState<TradeType>('BUY');
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Countdown states
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [orderPrice, setOrderPrice] = useState<number>(0);
  const [activeOrderType, setActiveOrderType] = useState<TradeType>('BUY');

  const durations = [
    { value: 60, label: '1menit' },
    { value: 120, label: '2menit' },
    { value: 180, label: '3menit' },
    { value: 300, label: '5menit' },
    { value: 600, label: '10menit' },
  ];

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
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  // Prevent page unload during countdown
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isCountdownActive) {
        e.preventDefault();
        e.returnValue = 'Order sedang berjalan. Jangan refresh atau pindah halaman!';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isCountdownActive]);

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

  const handleCryptoClick = (crypto: CryptocurrencyData, type: TradeType) => {
    setSelectedCrypto(crypto);
    setOrderType(type);
    setOrderAmount(0);
    setSelectedDuration(60);
    setIsOrderModalOpen(true);
  };

  const executeTrade = async (crypto: CryptocurrencyData, amount: number, price: number, tradeType: TradeType) => {
    try {
      const body = {
        tradeType: tradeType,
        coinId: crypto.id,
        coinCode: crypto.symbol,
        coinNominalExchange: amount,
        fiatCurrentcyCheckoutTime: price * amount,
      };


      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trade/commit-exchange`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          dev_chronome: "yes",
          authorization: `${sessionId}`
        },
        body: JSON.stringify(body),
        redirect: 'follow',
      });

      if (response.status === 401) {
        console.warn('Unauthorized. Redirecting...');
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${tradeType.toLowerCase()} coin.`);
      }

      setIsCountdownActive(false);
      setRemainingTime(0);

      const totalAmount = price * amount;
      const actionText = tradeType === 'BUY' ? 'Pembelian' : 'Penjualan';
      const prefix = tradeType === 'BUY' ? '+' : '-';
      
      toast({
        title: `✅ ${actionText} Berhasil`,
        description: `${prefix}${totalAmount.toLocaleString('id-ID', { minimumFractionDigits: 2 })} IDR`,
        className: tradeType === 'BUY' ? 'bg-green-600 text-white' : 'bg-red-600 text-white',
        duration: 3000,
      });

      setTimeout(() => {
        location.reload();
      }, 3000);
    } catch (error) {
      console.error('Trade execution error:', error);
      setIsCountdownActive(false);
      setRemainingTime(0);
      
      toast({
        title: 'Error',
        description: `Gagal ${tradeType === 'BUY' ? 'membeli' : 'menjual'} koin: ${error}`,
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  const startCountdown = () => {
    if (!selectedCrypto || orderAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Jumlah pesanan harus lebih dari 0',
        variant: 'destructive',
      });
      return;
    }

    const currentPrice = selectedCrypto.priceInTargetCurrency.price;

    setOrderPrice(currentPrice);
    setRemainingTime(selectedDuration);
    setIsCountdownActive(true);
    setActiveOrderType(orderType);
    setIsOrderModalOpen(false);

    const actionText = orderType === 'BUY' ? 'Beli Naik' : 'Beli Turun';
    toast({
      title: 'Order Dimulai',
      description: `${actionText} akan dieksekusi dalam ${selectedDuration} detik`,
    });

    let timeLeft = selectedDuration;
    const interval = setInterval(() => {
      timeLeft -= 1;
      setRemainingTime(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(interval);
        executeTrade(selectedCrypto, orderAmount, currentPrice, orderType);
      }
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      {/* Countdown Alert */}
      {isCountdownActive && selectedCrypto && (
        <Card className={`shadow-lg ${
          activeOrderType === 'BUY' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeOrderType === 'BUY' ? (
                  <TrendingUp className="w-5 h-5 text-green-600 animate-pulse" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 animate-pulse" />
                )}
                <div>
                  <p className={`font-semibold ${activeOrderType === 'BUY' ? 'text-green-900' : 'text-red-900'}`}>
                    Order {activeOrderType === 'BUY' ? 'Beli Naik' : 'Beli Turun'} Aktif
                  </p>
                  <p className={`text-sm ${activeOrderType === 'BUY' ? 'text-green-700' : 'text-red-700'}`}>
                    {orderAmount} {selectedCrypto.symbol} @ ${orderPrice.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-red-600 font-medium mt-1">
                    ⚠️ Jangan refresh atau pindah halaman!
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${activeOrderType === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                  {formatTime(remainingTime)}
                </p>
                <p className={`text-xs ${activeOrderType === 'BUY' ? 'text-green-700' : 'text-red-700'}`}>tersisa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
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
                  <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedCryptos.map((crypto) => (
                  <tr key={crypto.id} className="hover:bg-gray-50 transition-colors">
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
                          <span className="font-semibold text-sm">{crypto.symbol}/IDR</span>
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

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleCryptoClick(crypto, 'BUY')}
                          disabled={isCountdownActive}
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Naik
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCryptoClick(crypto, 'SELL')}
                          disabled={isCountdownActive}
                        >
                          <TrendingDown className="w-4 h-4 mr-1" />
                          Turun
                        </Button>
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
              <div key={crypto.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-4">
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
                      <span className="font-semibold text-base truncate">{crypto.symbol}/IDR</span>
                      <span className="text-sm text-gray-500 truncate">{crypto.name}</span>
                    </div>
                  </div>

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

                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
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

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                    onClick={() => handleCryptoClick(crypto, 'BUY')}
                    disabled={isCountdownActive}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Beli Naik
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleCryptoClick(crypto, 'SELL')}
                    disabled={isCountdownActive}
                  >
                    <TrendingDown className="w-4 h-4 mr-1" />
                    Beli Turun
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 text-center sm:text-left">
                Halaman {currentPage} dari {totalPages}
              </p>

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

      {/* Order Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                Konfirmasi {orderType === 'BUY' ? 'Beli Naik' : 'Beli Turun'}
              </DialogTitle>        
            </div>
          </DialogHeader>

          {selectedCrypto && (
            <div className="space-y-4 py-4">
              {/* Crypto Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {selectedCrypto.logoUrl && (
                  <Image
                    src={selectedCrypto.logoUrl}
                    alt={selectedCrypto.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold">{selectedCrypto.symbol}/IDR</p>
                  <p className="text-sm text-gray-600">{selectedCrypto.name}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-bold">IDR {formatPrice(selectedCrypto.priceInTargetCurrency.price)}</p>
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <p className="text-sm font-medium mb-3">Waktu pesanan</p>
                <div className="grid grid-cols-3 gap-2">
                  {durations.map((duration) => (
                    <button
                      key={duration.value}
                      onClick={() => setSelectedDuration(duration.value)}
                      className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                        selectedDuration === duration.value
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {duration.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Amount */}
              <div>
                <p className="text-sm font-medium mb-2">Jumlah pesanan</p>
                <input
                  type="number"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(parseFloat(e.target.value) || 0)}
                  className={`w-full text-center text-2xl font-bold py-3 px-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none ${
                    orderType === 'BUY' ? 'text-green-600' : 'text-red-600'
                  }`}
                  placeholder="0"
                />
              </div>

              {/* Total Balance Display */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Saldo:</span>
                  <span className="font-semibold">
                    {(selectedCrypto.priceInTargetCurrency.price * orderAmount).toLocaleString('id-ID', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    IDR
                  </span>
                </div>
              </div>

              {/* Info Text */}
              <p className="text-xs text-gray-500 text-center">
                Order akan dieksekusi otomatis setelah waktu yang dipilih
              </p>

              {/* Confirm Button */}
              <Button
                onClick={startCountdown}
                disabled={orderAmount <= 0 || loading}
                className={`w-full font-semibold py-6 text-base ${
                  orderType === 'BUY' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {loading ? 'Memproses...' : 'Mulai Order'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableCoin;