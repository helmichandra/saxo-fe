"use client";
import React, { SyntheticEvent, useEffect, useState } from "react";
import NonAuthLayout from "../../layouts/nonAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { validatePhoneNumber } from "@/lib/form-validation";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhonePrefix } from "@/models/Interface";

const RegisteredCode = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [phonePrefixes, setPhonePrefixes] = useState<PhonePrefix[]>([]);
  const [selectedPrefix, setSelectedPrefix] = useState("62");
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

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

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneNumberError("Tolong masukkan nomor handphone yang valid");
      return;
    }
    const fullPhoneNumber = `${selectedPrefix}${phoneNumber}`;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/registration/number-check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            dev_chronome: "yes",
          },
          body: JSON.stringify({
            phoneNumber: fullPhoneNumber.replace("+", ""),
          }),
        }
      );

      const data = await response.json();
      
      if(data.data.available == false){
        setLoading(false);
        toast({
          title: "Registrasi Gagal",
          description: "Nomor handphone sudah terdaftar",
          variant: "destructive",
          duration: 5000,
        });
        return
      }
      
      if (!response.ok) {
        setLoading(false);
        toast({
          title: "Registrasi Gagal",
          description: "" + data.message,
          variant: "destructive",
          duration: 5000,
        });
      }

      toast({
        title: `Registrasi awal berhasil`,
        description: "Harap hubungi konsultan untuk dapatkan kode register",
        duration: 5000,
      });

      setPhoneNumber("");
      setLoading(false);
    } catch (error) {
      console.error("Error sending code", error);
      toast({
        title: "Registration Failed",
        description: "" + error,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <NonAuthLayout>
      <div className="max-w-signup mx-auto py-10 px-10 flex flex-col items-center justify-center min-h-screen">
        <div className="welcome-head-auth">
          <h1 className="text-2xl text-center font-semibold">Register</h1>
          <p className="text-base text-center">
            Masukkan nomor handphone Anda untuk proses registrasi
          </p>
        </div>
        <div className="sign-content mx-auto py-16 max-w-signup w-full">
          <Toaster />
          <form onSubmit={handleSubmit}>
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
                    message={phoneNumberError}
                    className="flex-grow"
                    />
                </div>
              </div>
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                Nomor handphone tidak dapat diubah setelah pendaftaran
              </p>
            </div>
            <div className="forgot-password text-sm">
              <span>Sudah memiliki akun? </span>
              <Link
                href="/auth/signin"
                className="text-blue-600 font-bold cursor-pointer"
              >
                Login
              </Link>
            </div>
            <div className="flex justify-end">
              <Button variant="default" type="submit" disabled={loading}>
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
                  "Daftar Sekarang"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </NonAuthLayout>
  );
};

export default RegisteredCode;
