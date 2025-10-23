'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, RefreshCw, X, Clock } from 'lucide-react';
import { BottomNavigation } from '@/components/dashboard/user-view/BottomNavigation';
import { sessionId } from '@/lib/getSession';
import { useToast } from '@/hooks/use-toast';
import { logout } from '@/lib/auth';

// Extend Window interface untuk TradingView
declare global {
  interface Window {
    TradingView: any;
  }
}

interface CryptoPrice {
  price: string;
  change: string;
  changePercent: number;
  high: string;
  low: string;
  volume: string;
}

type TradeType = 'BUY' | 'SELL';

export default function TradingViewChart() {
  const { toast } = useToast();
  const router = useRouter();

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [selectedSymbol, setSelectedSymbol] = useState('BINANCE:BTCUSDT');
  const [selectedInterval, setSelectedInterval] = useState('15');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [coinAmount, setCoinAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderType, setOrderType] = useState<TradeType>('BUY');
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [orderAmount, setOrderAmount] = useState<number>(0);
  
  // Countdown states
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [orderPrice, setOrderPrice] = useState<number>(0);
  const [activeOrderType, setActiveOrderType] = useState<TradeType>('BUY');

  const [priceData, setPriceData] = useState<CryptoPrice>({
    price: '0',
    change: '0%',
    changePercent: 0,
    high: '0',
    low: '0',
    volume: '0',
  });

  const cryptoPairs = [
    { value: 'BINANCE:BTCUSDT', label: 'BTC/USDT', symbol: 'BTCUSDT', coinId: 'bitcoin', id: 1 },
    { value: 'BINANCE:ETHUSDT', label: 'ETH/USDT', symbol: 'ETHUSDT', coinId: 'ethereum', id: 2 },
    { value: 'BINANCE:BNBUSDT', label: 'BNB/USDT', symbol: 'BNBUSDT', coinId: 'binancecoin', id: 3 },
    { value: 'BINANCE:SOLUSDT', label: 'SOL/USDT', symbol: 'SOLUSDT', coinId: 'solana', id: 4 },
    { value: 'BINANCE:XRPUSDT', label: 'XRP/USDT', symbol: 'XRPUSDT', coinId: 'ripple', id: 5 },
    { value: 'BINANCE:ADAUSDT', label: 'ADA/USDT', symbol: 'ADAUSDT', coinId: 'cardano', id: 6 },
  ];

  const timeIntervals = [
    { value: '1', label: '1m' },
    { value: '5', label: '5m' },
    { value: '15', label: '15m' },
    { value: '30', label: '30m' },
    { value: '60', label: '1h' },
    { value: '240', label: '4h' },
    { value: 'D', label: '1D' },
  ];

  const durations = [
    { value: 60, label: '1menit' },
    { value: 120, label: '2menit' },
    { value: 180, label: '3menit' },
    { value: 300, label: '5menit' },
    { value: 600, label: '10menit' },
  ];

  const fetchPriceData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const currentPair = cryptoPairs.find((p) => p.value === selectedSymbol);
      if (!currentPair) return;

      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${currentPair.coinId}?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false&sparkline=false`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const m = data.market_data;
      const price = m.current_price.usd;
      const changePercent = m.price_change_percentage_24h;
      const high = m.high_24h.usd;
      const low = m.low_24h.usd;
      const volume = m.total_volume.usd;

      setPriceData({
        price: price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
        changePercent,
        high: high.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        low: low.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        volume: (volume / 1_000_000).toFixed(2) + 'M',
      });
    } catch (e) {
      console.error('Error fetching price data:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPriceData();
    const interval = setInterval(() => fetchPriceData(), 30000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => initWidget();
    document.body.appendChild(script);

    return () => {
      if (widgetRef.current) widgetRef.current.remove();
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.TradingView && chartContainerRef.current) {
      initWidget();
    }
  }, [selectedSymbol, selectedInterval]);

  const initWidget = () => {
    if (!chartContainerRef.current || !window.TradingView) return;

    setIsLoading(true);
    if (widgetRef.current) widgetRef.current.remove();
    chartContainerRef.current.innerHTML = '';

    try {
      widgetRef.current = new window.TradingView.widget({
        symbol: selectedSymbol,
        interval: selectedInterval,
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#09090b',
        hide_side_toolbar: false,
        hide_top_toolbar: false,
        allow_symbol_change: false,
        container_id: chartContainerRef.current.id,
        autosize: true,
        studies: ['MASimple@tv-basicstudies', 'Volume@tv-basicstudies'],
        disabled_features: ['use_localstorage_for_settings'],
        enabled_features: ['study_templates'],
        overrides: {
          'mainSeriesProperties.candleStyle.upColor': '#22c55e',
          'mainSeriesProperties.candleStyle.downColor': '#ef4444',
          'mainSeriesProperties.candleStyle.borderUpColor': '#22c55e',
          'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
          'mainSeriesProperties.candleStyle.wickUpColor': '#22c55e',
          'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444',
        },
      });

      setTimeout(() => setIsLoading(false), 1000);
    } catch (e) {
      console.error('Error initializing TradingView widget:', e);
      setIsLoading(false);
    }
  };

  const getCurrentPair = () => {
    const pair = cryptoPairs.find((p) => p.value === selectedSymbol);
    if (!pair) throw new Error('Pair tidak ditemukan');
    return pair;
  };

  const getCurrentPairName = () => getCurrentPair().label;
  const isPositive = priceData.changePercent >= 0;
  const priceNumber = parseFloat(priceData.price.replace(/,/g, '')) || 0;

  const openOrderModal = (type: TradeType) => {
    if (coinAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Masukkan jumlah koin terlebih dahulu',
        variant: 'destructive',
      });
      return;
    }
    setOrderType(type);
    setOrderAmount(coinAmount);
    setSelectedDuration(60);
    setIsOrderModalOpen(true);
  };

  const executeTrade = async (currentPair: any, amount: number, price: number, tradeType: TradeType) => {
    try {
      const body = {
        tradeType: tradeType,
        coinId: currentPair.id,
        coinCode: currentPair.symbol.replace('USDT', ''),
        coinNominalExchange: amount,
        fiatCurrentcyCheckoutTime: price * amount,
      };

      console.log('Executing trade with payload:', body);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trade/commit-exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `${sessionId}`,
        },
        body: JSON.stringify(body),
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

      // Show success popup
      const totalAmount = price * amount;
      const actionText = tradeType === 'BUY' ? 'Pembelian' : 'Penjualan';
      const prefix = tradeType === 'BUY' ? '+' : '-';
      
      toast({
        title: `✅ ${actionText} Berhasil`,
        description: `${prefix}${totalAmount.toLocaleString('id-ID', { minimumFractionDigits: 2 })} USD`,
        className: tradeType === 'BUY' ? 'bg-green-600 text-white' : 'bg-red-600 text-white',
      });

      // Reset states
      setIsCountdownActive(false);
      setRemainingTime(0);
      setCoinAmount(0);
      
      // Reload after delay
      setTimeout(() => {
        location.reload();
      }, 1500);
    } catch (error) {
      console.error('Trade execution error:', error);
      toast({
        title: 'Error',
        description: `Gagal ${tradeType === 'BUY' ? 'membeli' : 'menjual'} koin: ${error}`,
        variant: 'destructive',
      });
      setIsCountdownActive(false);
      setRemainingTime(0);
    }
  };

  const startCountdown = () => {
    if (orderAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Jumlah pesanan harus lebih dari 0',
        variant: 'destructive',
      });
      return;
    }

    const currentPair = getCurrentPair();
    const currentPrice = priceNumber;

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

    countdownIntervalRef.current = setInterval(() => {
      timeLeft -= 1;
      setRemainingTime(timeLeft);

      if (timeLeft <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        executeTrade(currentPair, orderAmount, currentPrice, orderType);
      }
    }, 1000);
  };

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden pb-16">
      <div className="container mx-auto p-4 max-w-6xl flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {getCurrentPairName()}
            </h1>
            <p className="text-sm text-muted-foreground">Grafik Trading Real-time</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchPriceData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Countdown Alert */}
        {isCountdownActive && (
          <Card className={`p-4 mb-4 shadow-lg ${
            activeOrderType === 'BUY' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
          }`}>
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
                    {orderAmount} {getCurrentPair().symbol.replace('USDT', '')} @ ${orderPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
          </Card>
        )}

        {/* Price Info Card */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold font-mono">
                {priceData.price}
              </span>
              <Badge
                variant={isPositive ? 'default' : 'destructive'}
                className="text-sm px-2 py-1"
              >
                <span className="flex items-center gap-1">
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {priceData.change}
                </span>
              </Badge>
            </div>
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Pair" />
              </SelectTrigger>
              <SelectContent>
                {cryptoPairs.map((pair) => (
                  <SelectItem key={pair.value} value={pair.value}>
                    {pair.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">24h Low</p>
              <p className="font-mono font-semibold text-sm">{priceData.low}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">24h High</p>
              <p className="font-mono font-semibold text-sm">{priceData.high}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
              <p className="font-mono font-semibold text-sm">{priceData.volume}</p>
            </div>
          </div>
        </Card>

        {/* Time Intervals */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap mr-2">Interval:</span>
          {timeIntervals.map((interval) => (
            <Button
              key={interval.value}
              onClick={() => setSelectedInterval(interval.value)}
              variant={selectedInterval === interval.value ? 'default' : 'outline'}
              size="sm"
              className="whitespace-nowrap"
            >
              {interval.label}
            </Button>
          ))}
        </div>

        {/* Chart */}
        <Card className="flex-1 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading chart...</p>
              </div>
            </div>
          )}
          <div id="tradingview_chart" ref={chartContainerRef} className="w-full h-full" />
        </Card>

        {/* Input jumlah coin */}
        <div className="flex items-center gap-2 mt-4">
          <input
            type="number"
            className="border rounded px-3 py-2 w-full text-right"
            placeholder="Jumlah koin"
            value={Number.isFinite(coinAmount) ? coinAmount : 0}
            onChange={(e) => setCoinAmount(parseFloat(e.target.value) || 0)}
            min={0}
            step="any"
            disabled={isCountdownActive}
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold"
            onClick={() => openOrderModal('BUY')}
            disabled={isCountdownActive}
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Beli Naik
          </Button>
          <Button
            size="lg"
            variant="destructive"
            className="font-semibold"
            onClick={() => openOrderModal('SELL')}
            disabled={isCountdownActive}
          >
            <TrendingDown className="w-5 h-5 mr-2" />
            Beli Turun
          </Button>
        </div>
      </div>

      {/* Order Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                Konfirmasi {orderType === 'BUY' ? 'Beli Naik' : 'Beli Turun'}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOrderModalOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
                  {(priceNumber * orderAmount).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  USD
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
              disabled={orderAmount <= 0}
              className={`w-full font-semibold py-6 text-base ${
                orderType === 'BUY' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              Mulai Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
}