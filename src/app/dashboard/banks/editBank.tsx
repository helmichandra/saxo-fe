import React, { SyntheticEvent, useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { sessionId } from "@/lib/getSession";
import { Bank, BankData, BankList, UserBank } from "@/models/Interface";
import { logout } from "@/lib/auth";

type EditBankProps = {
  mode: "company" | "user";
  bank: Bank | UserBank;
};

const EditBank: React.FC<EditBankProps> = ({ mode, bank }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [bankList, setBankList] = useState<BankList>({ bank: [], ewallet: [] });
  const [filteredBanks, setFilteredBanks] = useState<BankData[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(
    "type" in bank ? bank.type : "bank"
  );
  const [selectedBankName, setSelectedBankName] = useState<string>(bank.bankName || "");
  const [accountNumber, setAccountNumber] = useState(bank.accountNumber || "");
  const [holderName, setHolderName] = useState(bank.holderName || "");
  const [isActive, setIsActive] = useState<number>(bank.isActive);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [errors, setErrors] = useState<{ bankName?: string; accountNumber?: string; holderName?: string }>({});

  const apiEndpoint =
    mode === "company"
      ? `${process.env.NEXT_PUBLIC_API_URL}/fiat/editCompanyBank`
      : `${process.env.NEXT_PUBLIC_API_URL}/fiat/editUserBank`;

  useEffect(() => {
    if (sessionId) {
      fetchBanks();
    }
  }, []);

  useEffect(() => {
    if (selectedType === "bank") {
      setFilteredBanks(bankList.bank || []);
    } else if (selectedType === "ewallet") {
      setFilteredBanks(bankList.ewallet || []);
    }
  }, [selectedType, bankList]);

  useEffect(() => {
    if (selectedBankName) {
      const bank = bankList.bank.find((b) => b.name === selectedBankName);
      const ewallet = bankList.ewallet.find((e) => e.name === selectedBankName);

      if (bank) {
        setSelectedType("bank");
        setFilteredBanks(bankList.bank);
      } else if (ewallet) {
        setSelectedType("ewallet");
        setFilteredBanks(bankList.ewallet);
      }
    }
  }, [selectedBankName, bankList]);

  const fetchBanks = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fiat/getMasterBank`, {
        method: "POST",
        headers: {
          authorization: `${sessionId}`,
          dev_chronome: "yes",
        },
      });
      const data = await response.json();
      if (response.ok) {
        setBankList(data.data);
      } else {
        console.error("Failed to fetch banks:", data.message);
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setSelectedBankName("");
    if (type === "bank") {
      setFilteredBanks(bankList.bank || []);
    } else if (type === "ewallet") {
      setFilteredBanks(bankList.ewallet || []);
    }
  };

  const handleBankChange = (bankName: string) => {
    setSelectedBankName(bankName);
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    setErrors({});
    const newErrors: { bankName?: string; accountNumber?: string; holderName?: string } = {};

    if (!selectedBankName.trim()) newErrors.bankName = "Nama bank tidak boleh kosong.";
    if (!accountNumber.trim()) newErrors.accountNumber = "Nomor rekening tidak boleh kosong.";
    if (mode === "user" && !holderName.trim()) newErrors.holderName = "Nama pemegang rekening tidak boleh kosong.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const body =
      mode === "company"
        ? {
            bankId: "bankId" in bank ? bank.bankId : undefined,
            bankName: selectedBankName,
            accountNumber,
            isActive,
          }
        : {
            userBankAccountId:
              "userBankAccountId" in bank ? bank.userBankAccountId : undefined,
            bankName: selectedBankName,
            accountNumber,
            holderName,
            isActive,
          };

      const response = await fetch(apiEndpoint, {
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

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        throw new Error(data.message || "Edit bank gagal.");
      }

      toast({
        title: "Edit Bank Berhasil",
        description: `Data bank ${selectedBankName} berhasil diperbarui.`,
        duration: 5000,
      });

      setLoading(false);
      setIsDialogOpen(false);
      location.reload();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Edit Bank Gagal",
        description: '' + error || "Terjadi kesalahan.",
        variant: "destructive",
        duration: 5000,
      });
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <span className="relative hover:bg-gray-100 flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm">
            Edit
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {mode === "company" ? "Company" : "User"} {selectedType ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1) : "Bank"}
            </DialogTitle>
            <DialogDescription>
              Perbarui detail {selectedType ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1) : "Bank"} Anda dan simpan perubahan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label required>Tipe</Label>
              <Select value={selectedType || ""} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="ewallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label required>{selectedType === "bank" ? "Nama Bank" : "Nama E-Wallet"}</Label>
              <Select value={selectedBankName || ""} onValueChange={handleBankChange}>
                <SelectTrigger>
                    <SelectValue placeholder={`Pilih ${selectedType === "bank" ? "Bank" : "E-Wallet"}`} />
                </SelectTrigger>
                <SelectContent>
                  {filteredBanks.map((b) => (
                    <SelectItem key={b.bankId} value={b.name}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bankName && (
                <span className="text-red-500 text-sm">{errors.bankName}</span>
              )}
            </div>
            <div className="mb-4">
              <Label required>Nomor Rekening</Label>
              <Input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Masukkan nomor rekening"
              />
              {errors.accountNumber && (
                <span className="text-red-500 text-sm">{errors.accountNumber}</span>
              )}
            </div>
            {mode === "user" && (
              <div className="mb-4">
                <Label required>Nama Pemegang Rekening</Label>
                <Input
                  type="text"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  placeholder="Masukkan nama pemegang rekening"
                />
                {errors.holderName && (
                  <span className="text-red-500 text-sm">{errors.holderName}</span>
                )}
              </div>
            )}
            <div className="mb-4">
              <Label required>Status Aktif</Label>
              <Select
                value={isActive.toString()}
                onValueChange={(value) => setIsActive(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Aktif</SelectItem>
                  <SelectItem value="0">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Batal</Button>
              </DialogClose>
              <Button type="submit" variant="default" disabled={loading}>
                {loading ? "Loading..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditBank;
