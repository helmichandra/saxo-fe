'use client';

import { useEffect, useRef, useState } from 'react';
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
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { BottomNavigation } from "@/components/dashboard/user-view/BottomNavigation";

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

export default function TradingViewChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('BINANCE:BTCUSDT');
  const [selectedInterval, setSelectedInterval] = useState('15');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [priceData, setPriceData] = useState<CryptoPrice>({
    price: '0',
    change: '0%',
    changePercent: 0,
    high: '0',
    low: '0',
    volume: '0',
  });

  const cryptoPairs = [
    { value: 'BINANCE:BTCUSDT', label: 'BTC/USDT', symbol: 'BTCUSDT', coinId: 'bitcoin' },
    { value: 'BINANCE:ETHUSDT', label: 'ETH/USDT', symbol: 'ETHUSDT', coinId: 'ethereum' },
    { value: 'BINANCE:BNBUSDT', label: 'BNB/USDT', symbol: 'BNBUSDT', coinId: 'binancecoin' },
    { value: 'BINANCE:SOLUSDT', label: 'SOL/USDT', symbol: 'SOLUSDT', coinId: 'solana' },
    { value: 'BINANCE:XRPUSDT', label: 'XRP/USDT', symbol: 'XRPUSDT', coinId: 'ripple' },
    { value: 'BINANCE:ADAUSDT', label: 'ADA/USDT', symbol: 'ADAUSDT', coinId: 'cardano' },
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

  // Fetch live data from CoinGecko API
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
      const marketData = data.market_data;
      const price = marketData.current_price.usd;
      const changePercent = marketData.price_change_percentage_24h;
      const high = marketData.high_24h.usd;
      const low = marketData.low_24h.usd;
      const volume = marketData.total_volume.usd;

      const formattedChange =
        changePercent >= 0
          ? `+${changePercent.toFixed(2)}%`
          : `${changePercent.toFixed(2)}%`;

      setPriceData({
        price: price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        change: formattedChange,
        changePercent: changePercent,
        high: high.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        low: low.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        volume: (volume / 1000000).toFixed(2) + 'M',
      });
    } catch (error) {
      console.error('Error fetching price data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch data on mount and symbol change
  useEffect(() => {
    fetchPriceData();
    const interval = setInterval(() => fetchPriceData(), 30000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  // Load TradingView script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => initWidget();
    document.body.appendChild(script);

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (window.TradingView && chartContainerRef.current) {
      initWidget();
    }
  }, [selectedSymbol, selectedInterval]);

  const initWidget = () => {
    if (!chartContainerRef.current || !window.TradingView) return;

    setIsLoading(true);

    if (widgetRef.current) {
      widgetRef.current.remove();
    }

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
    } catch (error) {
      console.error('Error initializing TradingView widget:', error);
      setIsLoading(false);
    }
  };

  const getCurrentPairName = () => {
    const pair = cryptoPairs.find((p) => p.value === selectedSymbol);
    return pair ? pair.label : 'BTC/USDT';
  };

  const isPositive = priceData.changePercent >= 0;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden pb-16">
      <div className="container mx-auto p-4 max-w-6xl flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {getCurrentPairName()}
            </h1>
            <p className="text-sm text-muted-foreground">
              Grafik Trading Real-time
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchPriceData(true)}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>

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
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
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
              <p className="font-mono font-semibold text-sm">
                {priceData.low}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">24h High</p>
              <p className="font-mono font-semibold text-sm">
                {priceData.high}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
              <p className="font-mono font-semibold text-sm">
                {priceData.volume}
              </p>
            </div>
          </div>
        </Card>

        {/* Time Intervals */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap mr-2">
            Interval:
          </span>
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
          <div
            id="tradingview_chart"
            ref={chartContainerRef}
            className="w-full h-full"
          />
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold"
            onClick={() => alert('Beli Naik')}
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Beli Naik
          </Button>
          <Button
            size="lg"
            variant="destructive"
            className="font-semibold"
            onClick={() => alert('Beli Turun')}
          >
            <TrendingDown className="w-5 h-5 mr-2" />
            Beli Turun
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}