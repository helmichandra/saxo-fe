import { useState, useEffect, SyntheticEvent } from "react";
import { Wallet, DollarSign, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { sessionId } from "@/lib/getSession";
import { BankData } from "@/models/Interface";
import { logout } from "@/lib/auth";

export function ActionButtons() {
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [bankAccountId, setBankAccountId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [userTransferFile, setUserTransferFile] = useState<File | null>(null);
  const [companyBanks, setCompanyBanks] = useState<BankData[]>([]);
  const [userBanks, setUserBanks] = useState<BankData[]>([]);
  const [userFiatBalance, setUserFiatBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCompanyBanks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fiat/getBank`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          dev_chronome: "yes",
          authorization: `${sessionId}`
        },
      });
      if (!response.ok) throw new Error("Failed to fetch company banks");
      const data = await response.json();
      setCompanyBanks(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching company banks:", error);
      setLoading(false);
    }
  };

  const fetchUserBanks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fiat/getUserBank`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          dev_chronome: "yes",
          authorization: `${sessionId}`
        },
      });
      if (!response.ok) throw new Error("Failed to fetch user banks");
      const data = await response.json();
      setUserBanks(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user banks:", error);
      setLoading(false);
    }
  };

  const fetchFiatBalance = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fiat/balance/getWalletBalance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          dev_chronome: 'yes',
          authorization: `${sessionId}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch balance');
      const data = await response.json();
      setUserFiatBalance(data.data?.balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    if (depositDialogOpen) {
      fetchCompanyBanks();
      fetchFiatBalance();
    }
  }, [depositDialogOpen]);

  useEffect(() => {
    if (withdrawDialogOpen) {
      fetchUserBanks();
      fetchFiatBalance();
    }
  }, [withdrawDialogOpen]);

  const handleDepositSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      let fileName = "";
      
      if (userTransferFile) {
        const formData = new FormData();
        formData.append("file", userTransferFile);
        const uploadResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/fiat/request/deposit/uploadTranscript`,
          {
            method: "POST",
            headers: {
              dev_chronome: "yes",
              authorization: `${sessionId}`,
            },
            body: formData,
          }
        );
        if (!uploadResponse.ok) {
          setLoading(false);
          throw new Error("Failed to upload transfer transcript");
        }
        const uploadData = await uploadResponse.json();
        fileName = uploadData.data.fileName;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fiat/request/deposit/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          dev_chronome: "yes",
          authorization: `${sessionId}`,
        },
        body: JSON.stringify({
          requestedAmount: amount,
          bankId: paymentMethod,
          userTransferTranscript: fileName,
        }),
      });

      if (response.status === 401) {
        console.warn("Unauthorized. Redirecting...");
        logout();
        return;
      }

      if (!response.ok) {
        setLoading(false);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setAmount(0);
      setPaymentMethod("");
      setUserTransferFile(null);
      setLoading(false);
      setDepositDialogOpen(false);
      location.reload();
    } catch (error) {
      console.error("Error submitting deposit:", error);
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fiat/request/withdraw/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          dev_chronome: "yes",
          authorization: `${sessionId}`,
        },
        body: JSON.stringify({
          fiatAmountAtRequest: amount,
          userBankAccountId: bankAccountId,
        }),
      });

      if (response.status === 401) {
        console.warn("Unauthorized. Redirecting...");
        logout();
        return;
      }

      if (!response.ok) {
        setLoading(false);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setAmount(0);
      setBankAccountId("");
      setLoading(false);
      setWithdrawDialogOpen(false);
      location.reload();
    } catch (error) {
      console.error("Error submitting withdraw:", error);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => setDepositDialogOpen(true)}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold h-auto py-4 group"
        >
          <Wallet className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          Isi Ulang
        </Button>
        <Button
          onClick={() => setWithdrawDialogOpen(true)}
          size="lg"
          variant="secondary"
          className="font-semibold h-auto py-4 group"
        >
          <DollarSign className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          Tarik Dana
        </Button>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-600" />
              Isi Ulang Saldo
            </DialogTitle>
            <DialogDescription>
              Masukkan detail deposit Anda
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDepositSubmit} className="space-y-4">
            {/* Balance Info */}
            <Card className="p-3 bg-muted">
              <p className="text-xs text-muted-foreground mb-1">Saldo Saat Ini</p>
              <p className="font-mono font-semibold text-lg">
                {userFiatBalance !== null
                  ? Number(userFiatBalance).toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 2,
                    })
                  : 'Loading...'}
              </p>
            </Card>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Jumlah Deposit</Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="Masukkan jumlah"
                required
                min="10000"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="payment-method">Metode Pembayaran</Label>
              <Select onValueChange={setPaymentMethod} value={paymentMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Pilih Metode Pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  {companyBanks.map((bank) => (
                    <SelectItem key={bank.bankId} value={bank.bankId}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{bank.bankName}</span>
                        <span className="text-muted-foreground">({bank.accountNumber})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload File */}
            <div className="space-y-2">
              <Label htmlFor="deposit-file">Bukti Transfer</Label>
              <div className="relative">
                <Input
                  id="deposit-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      setUserTransferFile(e.target.files[0]);
                    }
                  }}
                  required
                  className="cursor-pointer"
                />
                {userTransferFile && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    {userTransferFile.name}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Kirim Deposit"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Tarik Dana
            </DialogTitle>
            <DialogDescription>
              Masukkan detail penarikan Anda
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            {/* Balance Info */}
            <Card className="p-3 bg-muted">
              <p className="text-xs text-muted-foreground mb-1">Saldo Tersedia</p>
              <p className="font-mono font-semibold text-lg">
                {userFiatBalance !== null
                  ? Number(userFiatBalance).toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 2,
                    })
                  : 'Loading...'}
              </p>
            </Card>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Jumlah Penarikan</Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="Masukkan jumlah"
                required
                min="10000"
                max={userFiatBalance || 0}
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            {/* Bank Account */}
            <div className="space-y-2">
              <Label htmlFor="bank-account">Rekening Tujuan</Label>
              <Select onValueChange={setBankAccountId} value={bankAccountId}>
                <SelectTrigger id="bank-account">
                  <SelectValue placeholder="Pilih Rekening Tujuan" />
                </SelectTrigger>
                <SelectContent>
                  {userBanks.map((bank) => (
                    <SelectItem key={bank.userBankAccountId} value={bank.userBankAccountId}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{bank.bankName}</span>
                        <span className="text-muted-foreground">({bank.accountNumber})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Tarik Dana"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}