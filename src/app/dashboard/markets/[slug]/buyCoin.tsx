import React, { useEffect, useState } from "react";
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
import { CryptocurrencyData } from "@/models/Interface";
import { sessionId } from "@/lib/getSession";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/auth";

const BuyCoin = ( crypto : CryptocurrencyData) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [coinAmount, setCoinAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fiatBalance, setFiatBalance] = useState<number | null>(null);

  const {toast} = useToast();


    useEffect(() => {
    const fetchFiatBalance = async () => {
      if (!sessionId) {
        return;
      }
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
        console.warn("Unauthorized. Redirecting...");
        logout();
        return;
      }

        if (!response.ok) {
          throw new Error("Failed to fetch balance");
        }

        const data = await response.json();
        setFiatBalance(data.data?.balance || 0);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchFiatBalance();
  }, []);

  const handleBuy = async () => {
    setLoading(true);
    setError(null);

    if (coinAmount <= 0 || coinAmount === 0) {
      toast({
        title: "Error",
        description: "Jumlah koin tidak valid",
        variant: "destructive",
      });
      return;
    }

    if(!sessionId){
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
          authorization: `${sessionId}`
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Gagal mengambil data",
          description: `Gagal untuk membeli coin: ${data.message}`,
          variant: "destructive",
          duration: 5000
        })
        setLoading(false);
        throw new Error(`Failed to buy coin: ${data.message}`);
      }

      toast({
        title: "Sukses membeli koin",
        description: "Berhasil membeli koin " + crypto.name,
        duration: 5000
      })
      setIsDialogOpen(false);
      location.reload();
    } catch (err) {
        toast({
          title: "Error dalam membeli coin",
          description: `Gagal untuk membeli coin: ${err}`,
          variant: "destructive",
          duration: 5000
        })
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>Beli {crypto.name}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beli {crypto.name}</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border py-3 px-5">
            <label className="block mb-2 font-bold text-sm">Jumlah Koin:</label>
            <input
              type="number"
              value={coinAmount}
              onChange={(e) => setCoinAmount(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
              placeholder="Masukkan jumlah koin yang dibeli, misal 1, 0,2, 0,5"
            />
            <small className="text-red-500 mt-2"><span>Saldo Fiat Anda: </span>
            {fiatBalance !== null
            ? `${Number(fiatBalance).toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 2,
              })}`
            : "Tidak ada saldo"}
            </small>
            <br />
            <small className="text-red-500 mt-2">
              <span>Harga {crypto.name} per satuan: </span>
              Rp
                {Number(
                  crypto.priceInTargetCurrency.price.toFixed(2)
                ).toLocaleString()}</small>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
          <DialogFooter>
            <Button onClick={handleBuy} disabled={loading}>
              {loading ? "Processing..." : `Buy ${crypto.symbol}`}
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyCoin;
