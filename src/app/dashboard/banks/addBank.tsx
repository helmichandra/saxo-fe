"use client";
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
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { sessionId } from "@/lib/getSession";
import { AddBankProps, BankData, BankList } from "@/models/Interface";
import { logout } from "@/lib/auth";




const AddBank: React.FC<AddBankProps> = ({ mode }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [bankList, setBankList] = useState<BankList>({ bank: [], ewallet: [] });
  const [filteredBanks, setFilteredBanks] = useState<BankData[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedBankName, setSelectedBankName] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const dialogTitle = mode === "company" ? "Tambahkan Bank Perusahaan" : "Tambahkan Bank Pengguna";

  useEffect(() => {
    if (sessionId) {
      fetchBanks();
    }
  }, []);

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
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
      setLoading(false);
    }
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);

    
    if (type === "bank") {
      setFilteredBanks(bankList.bank || []);
    } else if (type === "ewallet") {
      setFilteredBanks(bankList.ewallet || []);
    }

    setSelectedBankName(null); 
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    if (!selectedType || !selectedBankName) {
      toast({
        title: "Form Error",
        description: "Please select both a type and a bank or e-wallet.",
        variant: "destructive",
        duration: 5000,
      });
      setLoading(false);
      return;
    }

    if (accountNumber.trim() === "") {
      toast({
        title: "Form Error",
        description: "Please provide an account number.",
        variant: "destructive",
        duration: 5000,
      });
      setLoading(false);
      return;
    }

    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const body: { bankName: string; accountNumber: string; holderName?: string } = {
        bankName: selectedBankName,
        accountNumber,
      };

      if (mode === "user") {
        body.holderName = holderName;
      }


      const apiEndpoint =
        mode === "company"
          ? `${process.env.NEXT_PUBLIC_API_URL}/fiat/addCompanyBank`
          : `${process.env.NEXT_PUBLIC_API_URL}/fiat/addUserBank`;

      const response = await fetch(apiEndpoint, {
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
        toast({
          title: "Gagal Menambahkan Bank",
          description: data.message,
          variant: "destructive",
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Bank Berhasil Ditambahkan",
        description: data.message,
        duration: 5000,
      });

      setLoading(false);
      setIsDialogOpen(false);
      location.reload();
    } catch (error) {
      console.error("Error submitting the form:", error);
      toast({
        title: "Gagal Menambahkan Bank",
        description: `${error}`,
        variant: "destructive",
        duration: 5000,
      });
      setLoading(false);
    }
  };

  return (
    <div>
      <Toaster />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="button">
            {mode === "company" ? "Tambahkan Bank Perusahaan" : "Tambahkan Bank User"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              Silakan masukkan informasi bank atau e-wallet di bawah ini
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-5">
              <Label required>Tipe</Label>
              <Select onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="ewallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedType && (
              <div className="form-group mb-5">
                <Label required>{selectedType === "bank" ? "Nama Bank" : "Nama E-Wallet"}</Label>
                <Select onValueChange={setSelectedBankName}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Pilih ${selectedType === "bank" ? "Bank" : "E-Wallet"}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBanks.map((bank) => (
                      <SelectItem key={bank.bankId} value={bank.name}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {mode === "user" && (
              <div className="form-group mb-5">
                <Label required>Nama Pemegang Rekening</Label>
                <Input
                  type="text"
                  placeholder="Nama Pemegang Rekening"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                />
              </div>
            )}
            <div className="form-group mb-5">
              <Label required>Nomor Rekening</Label>
              <Input
                type="text"
                placeholder="Nomor Rekening"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit" variant="default" disabled={loading}>
                {loading ? "Loading..." : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddBank;

