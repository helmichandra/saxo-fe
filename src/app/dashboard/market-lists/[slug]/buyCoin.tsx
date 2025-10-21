"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CryptocurrencyData } from "@/models/Interface";
import { sessionId } from "@/lib/getSession";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/auth";

type Props = CryptocurrencyData;

const BuyCoin: React.FC<Props> = (crypto) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [coinAmount, setCoinAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fiatBalance, setFiatBalance] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFiatBalance = async () => {
      if (!sessionId) return;
      try {
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
          logout();
          return;
        }
        if (!response.ok) throw new Error("Failed to fetch balance");
        const data = await response.json();
        setFiatBalance(data.data?.balance || 0);
      } catch (e) {
        console.error("Error fetching balance:", e);
      }
    };
    fetchFiatBalance();
  }, []);

  const handleBuy = async () => {
    setLoading(true);
    setError(null);

    if (coinAmount <= 0) {
      toast({ title: "Error", description: "Jumlah koin tidak valid", variant: "destructive" });
      setLoading(false);
      return;
    }
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      const body = {
        tradeType: "BUY",
        coinId: crypto.id,
        coinCode: crypto.symbol,
        coinNominalExchange: coinAmount,
        fiatCurrentcyCheckoutTime: crypto.priceInTargetCurrency.price * coinAmount,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trade/commit-exchange`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          dev_chronome: "yes",
          authorization: `${sessionId}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        toast({
          title: "Gagal membeli",
          description: data.message || "Gagal memproses pembelian.",
          variant: "destructive",
        });
        setLoading(false);
        throw new Error(`Failed to buy coin: ${data.message}`);
      }

      toast({ title: "Sukses", description: `Berhasil membeli ${crypto.name}` });
      setIsDialogOpen(false);
      location.reload();
    } catch (err) {
      toast({
        title: "Error",
        description: `Gagal untuk membeli koin: ${err}`,
        variant: "destructive",
      });
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatIDR = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
      Math.round(n || 0)
    );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          Beli {crypto.symbol}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Beli {crypto.name}</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border p-4 space-y-2">
          <label className="block text-sm font-semibold">Jumlah Koin</label>
          <input
            type="number"
            value={coinAmount}
            onChange={(e) => setCoinAmount(Number(e.target.value))}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Contoh: 0.2, 1, 5"
          />
          <div className="text-xs text-neutral-500">
            Saldo Fiat: <span className="font-semibold">{fiatBalance !== null ? formatIDR(fiatBalance) : "—"}</span>
          </div>
          <div className="text-xs text-neutral-500">
            Harga {crypto.symbol}/1: <span className="font-semibold">{formatIDR(crypto.priceInTargetCurrency.price)}</span>
          </div>
          {error && <p className="text-red-600 text-xs">{error}</p>}
        </div>

        <DialogFooter>
          <Button onClick={handleBuy} disabled={loading}>
            {loading ? "Processing..." : `Buy ${crypto.symbol}`}
          </Button>
          <DialogClose asChild>
            <Button variant="ghost">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCoin;
