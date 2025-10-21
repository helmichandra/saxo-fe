"use client";

import React, { useState } from "react";
import {
  Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sessionId } from "@/lib/getSession";
import { CryptoWallet } from "@/models/Interface";
import { logout } from "@/lib/auth";

type Props = CryptoWallet;

const SellCoin: React.FC<Props> = (porto) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [coinAmount, setCoinAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSell = async () => {
    if (coinAmount <= 0 || coinAmount > porto.balance) {
      toast({
        title: "Error",
        description: "Jumlah koin tidak valid atau melebihi saldo.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const body = {
        tradeType: "SELL",
        coinId: porto.coinId,
        coinCode: porto.coinCode,
        coinNominalExchange: coinAmount,
        fiatCurrentcyCheckoutTime: porto.cryptocurrencyType.currentIdrRate * coinAmount,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trade/commit-exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `${sessionId}` },
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to sell coin.");

      toast({ title: "Berhasil", description: `Menjual ${coinAmount} ${porto.coinCode}` });
      setIsDialogOpen(false);
      location.reload();
    } catch (error) {
      toast({ title: "Error", description: `Gagal menjual: ${error}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">Jual {porto.coinCode}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Jual {porto.coinCode}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm">Saldo: <b>{porto.balance}</b> {porto.coinCode}</p>
          <input
            type="number"
            value={coinAmount}
            onChange={(e) => setCoinAmount(Number(e.target.value))}
            placeholder="Masukkan jumlah koin"
            className="w-full border px-3 py-2 rounded text-sm"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSell} disabled={loading}>
            {loading ? "Processing..." : "Sell"}
          </Button>
          <DialogClose asChild>
            <Button variant="ghost">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SellCoin;
