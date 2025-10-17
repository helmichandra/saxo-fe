import React, { SyntheticEvent, useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import { sessionId } from "@/lib/getSession";
import { logout } from "@/lib/auth";
import { validateEmail, validatePhoneNumber } from "@/lib/form-validation";
import { PhonePrefix, RegisteredData } from "@/models/Interface";

const AddUser = ({ isAdminTable }: { isAdminTable?: boolean }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<RegisteredData | null>(null);


  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [phonePrefixes, setPhonePrefixes] = useState<PhonePrefix[]>([]);
  const [selectedPrefix, setSelectedPrefix] = useState("62");

  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const isAdmin = isAdminTable ? 1 : 0;
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFullName = e.target.value;

    if (inputFullName.trim() === "") {
      setFullNameError("Tolong masukkan nama lengkap anda");
    } else {
      setFullNameError("");
    }

    setFullName(inputFullName);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEmail = e.target.value;

    if (!validateEmail(inputEmail)) {
      setEmailError("Tolong masukkan email yang valid");
    } else {
      setEmailError("");
    }

    setEmail(inputEmail);
  };

  useEffect(() => {
    const fetchPhonePrefixes = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/phone-prefix`
        );
        const data = await response.json();
        setPhonePrefixes(data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching phone prefixes:", error);
        setLoading(false);
      }
    };
    fetchPhonePrefixes();
  }, []);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputNumber = e.target.value;
    if (!validatePhoneNumber(inputNumber)) {
      setPhoneNumberError("Tolong masukkan nomor handphone yang valid");
    } else {
      setPhoneNumberError("");
    }
    setPhoneNumber(inputNumber);
  };

  const handlePrefixChange = (value: string) => {
    setSelectedPrefix(value.replace("+", ""));
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    let hasError = false;

    if (fullName.trim() === "") {
      setFullNameError("Tolong masukkan nama lengkap anda");
      hasError = true;
    } else {
      setFullNameError("");
    }

    if (!validateEmail(email)) {
      setEmailError("Tolong masukkan email yang valid");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneNumberError("Tolong masukkan nomor handphone yang valid");
      return;
    }

    const fullPhoneNumber = `${selectedPrefix}${phoneNumber}`;

    if (hasError) {
      setLoading(false);
      return;
    }

    if (!sessionId) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/admin/users/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            dev_chronome: "yes",
            authorization: `${sessionId}`,
          },
          body: JSON.stringify({
            userFullName: fullName,
            email: email,
            phoneNumber: fullPhoneNumber,
            isActive: 1,
            isAdmin: isAdmin,
          }),
        }
      );

      if (response.status === 401) {
        console.warn("Unauthorized. Redirecting...");
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        toast({
          title: "Registrasi Gagal",
          description: data.message,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      setSubmittedData(data.data); 
      setIsDialogOpen(false); 
      setSummaryModalOpen(true); 
    } catch (error) {
      console.error("Error submitting the form:", error);
      setLoading(false);
      toast({
        title: "Registrasi Gagal",
        description: String(error),
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSummaryModalClose = () => {
    setSummaryModalOpen(false);
    location.reload(); // Reload the page after the summary modal is closed
  };

  return (
    <div>
      <Toaster />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="button">{isAdminTable ? "Tambah Admin Baru" : "Tambah User Baru"}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAdminTable ? "Tambah Admin Baru" : "Tambah User Baru"}</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-5">
              <Label required>Nama Lengkap</Label>
              <Input
                type="text"
                placeholder="Nama Lengkap"
                required
                value={fullName}
                message={fullNameError}
                onChange={handleFullNameChange}
              />
            </div>
            <div className="form-group mb-5">
              <Label required>Email</Label>
              <Input
                type="email"
                placeholder="Email"
                required
                value={email}
                message={emailError}
                onChange={handleEmailChange}
              />
            </div>
            <div className="form-group mb-5">
              <Label required>Nomor Handphone</Label>
              <div className="flex space-x-2">
                <Select onValueChange={handlePrefixChange}>
                  <SelectTrigger className="w-[189px]">
                    <SelectValue placeholder={selectedPrefix} />
                  </SelectTrigger>
                  <SelectContent>
                    {loading && <p className="text-xs">Loading...</p>}
                    {phonePrefixes.map((prefix) => (
                      <SelectItem key={prefix.id} value={prefix.prefix}>
                        {prefix.country} {prefix.prefix}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="w-full">
                <Input
                  type="text"
                  placeholder="812345678"
                  required
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  className="flex-grow"
                  />
                </div>
              </div>
              <span className="text-red-500 text-sm">{phoneNumberError}</span>
            </div>

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
                  "Tambah User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {submittedData && (
        <Dialog open={summaryModalOpen} onOpenChange={handleSummaryModalClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrasi Berhasil</DialogTitle>
              <DialogDescription>
                Berikut adalah data pengguna baru, silahkan informasikan ke User terkait
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <p className="capitalize">
                <strong>Nama Lengkap:</strong> {fullName || "Tidak Tersedia"}
              </p>
              <p>
                <strong>Email:</strong> {submittedData.email}
              </p>
              <p>
                <strong>Role:</strong> {submittedData.isAdmin === "admin" ? "Admin" : "User"}
              </p>
              <p>
                <strong>Password:</strong> {submittedData.passwordRegister}
              </p>
            </div>
            <DialogFooter>
              <Button variant="default" onClick={handleSummaryModalClose}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AddUser;
