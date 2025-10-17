import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sessionId } from "@/lib/getSession";
import { CryptoWallet } from "@/models/Interface";
import { logout } from "@/lib/auth";



const SellCoin = (porto: CryptoWallet) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [coinAmount, setCoinAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSell = async () => {
    if (coinAmount <= 0 || coinAmount > porto.balance) {
      toast({
        title: "Error",
        description: "Jumlah koin tidak valid atau melebihi saldo Anda.",
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
        headers: {
          "Content-Type": "application/json",
          authorization: `${sessionId}`,
        },
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        console.warn("Unauthorized. Redirecting...");
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sell coin.");
      }

      toast({
        title: "Berhasil menjual koin",
        description: `Anda berhasil menjual ${coinAmount} ${porto.coinCode}.`,
      });
      setIsDialogOpen(false);
      location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal menjual koin: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <span className="relative hover:bg-gray-100 flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">
            Jual {porto.coinCode}
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jual {porto.coinCode}</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-sm mb-2">Koin Anda: {porto.balance} {porto.coinCode}</p>
            <input
              type="number"
              value={coinAmount}
              onChange={(e) => setCoinAmount(Number(e.target.value))}
              placeholder="Masukkan jumlah koin"
              className="w-full border px-3 py-2 rounded"
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
    </div>
  );
};

export default SellCoin;
