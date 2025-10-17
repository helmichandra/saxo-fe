import React, { SyntheticEvent, useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sessionId } from "@/lib/getSession";
import { BankData } from "@/models/Interface";
import { logout } from "@/lib/auth";

const AddRequest = () => {
  const [amount, setAmount] = useState<number>(0);
  const [transactionType, setTransactionType] = useState<string>("");
  const [bankAccountId, setBankAccountId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [userTransferFile, setUserTransferFile] = useState<File | null>(null);
  const [companyBanks, setCompanyBanks] = useState<BankData[]>([]);
  const [userBanks, setUserBanks] = useState<BankData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [userFiatBalance, setUserFiatBalance] = useState(null);
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

      if (!response.ok) {
        throw new Error("Failed to fetch company banks");
      }

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

      if (!response.ok) {
        throw new Error("Failed to fetch user banks");
      }

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
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fiat/balance/getWalletBalance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            dev_chronome: 'yes',
            authorization: `${sessionId}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch balance');
        }

        const data = await response.json();

        setUserFiatBalance(data.data?.balance || 0);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

  useEffect(() => {
    if (transactionType === "deposit" || transactionType === "Deposit") {
      fetchCompanyBanks();
    } else if (transactionType === "withdraw" || transactionType === "Withdraw") {
      fetchUserBanks();
    }
    fetchFiatBalance();
  }, [transactionType]);

const handleSubmit = async (e: SyntheticEvent) => {
  e.preventDefault();

  try {
    setLoading(true);
    let fileName = "";


    if ((transactionType === "deposit" || transactionType === "Deposit") && userTransferFile) {
      const formData = new FormData();
      formData.append("file", userTransferFile);

      const uploadResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/fiat/request/deposit/uploadTranscript`,
        {
          method: "POST",
          headers: {
            // "Content-Type": "multipart/form-data",
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

    const endpoint =
      transactionType === "deposit" || transactionType === "Deposit"
        ? `${process.env.NEXT_PUBLIC_API_URL}/fiat/request/deposit/add`
        : `${process.env.NEXT_PUBLIC_API_URL}/fiat/request/withdraw/add`;

    const body =
      transactionType === "deposit" || transactionType === "Deposit"
        ? {
            requestedAmount: amount,
            bankId: paymentMethod,
            userTransferTranscript: fileName,
          }
        : {
            fiatAmountAtRequest: amount,
            userBankAccountId: bankAccountId,
          };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        dev_chronome: "yes",
        authorization: `${sessionId}`,
      },
      body: JSON.stringify(body),
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
    setTransactionType("");
    setPaymentMethod("");
    setUserTransferFile(null);
    setBankAccountId("");

    setLoading(false);
    setIsDialogOpen(false);
    location.reload();
  } catch (error) {
    console.error("Error submitting the form:", error);
    setLoading(false);
  }
};


  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="button">Tambah Permintaan</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Permintaan</DialogTitle>
            <DialogDescription>
              Sertakan detail permintaan
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-5">
              <Label required>Jumlah</Label>
              <Input
                type="number"
                placeholder="Jumlah Uang"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
              <span className="text-xs text-gray-500">
                <span>Saldo Fiat Anda: </span> 
                {userFiatBalance !== null
              ? `${Number(userFiatBalance).toLocaleString('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 2,
                })}`
              : 'Loading...'}
              </span>
            </div>
            <div className="form-group mb-5">
              <Label required>Jenis Permintaan</Label>
              <Select onValueChange={setTransactionType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Jenis Request" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdraw">Withdraw</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(transactionType === "withdraw" || transactionType === "Withdraw") && (
              <div className="form-group mb-5">
                <Label required>Rekening Tujuan</Label>
                <Select onValueChange={setBankAccountId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Rekening Tujuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {userBanks.map((bank) => (
                      <SelectItem key={bank.userBankAccountId} value={bank.userBankAccountId}>
                        {bank.bankName} ({bank.accountNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {(transactionType === "deposit" || transactionType === "Deposit") && (
              <>
                <div className="form-group mb-5">
                  <Label required>Metode Pembayaran</Label>
                  <Select onValueChange={setPaymentMethod}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Metode Pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {companyBanks.map((bank) => (
                        <SelectItem key={bank.bankId} value={bank.bankId}>
                          {bank.bankName} ({bank.accountNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-group mb-5">
                  <Label required>Bukti Transfer</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        setUserTransferFile(e.target.files[0]);
                      }
                    }}
                    required
                  />
                </div>
              </>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit" variant="default" disabled={loading}>
                {loading ? (
                  <>
                    <span>Loading </span>
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="inline w-4 h-4 mr-3 text-white animate-spin"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      >
                      <path
                        d="M100 50.5A50 50 0 1 1 50 0v10a40 40 0 1 0 40 40h10z"
                        fill="currentColor"
                        />
                    </svg>
                  </>
                ) : (
                  "Tambah Request"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddRequest;
