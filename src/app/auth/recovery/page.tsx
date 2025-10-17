"use client";
import { Button } from "@/components/ui/button";
import React, { SyntheticEvent, useEffect } from "react";
import { useState } from "react";
import NonAuth from "@/app/layouts/nonAuth";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
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
import { useRouter } from "next/navigation";

const Recovery = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");

  const [phonePrefixes, setPhonePrefixes] = useState<PhonePrefix[]>([]);
  const [selectedPrefix, setSelectedPrefix] = useState("62");

  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

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

  const handlePrefixChange = (value: string) => {
    setSelectedPrefix(value.replace("+", ""));
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputNumber = e.target.value;

    if (!validatePhoneNumber(inputNumber)) {
      setPhoneNumberError("Tolong masukkan nomor handphone yang valid");
    } else {
      setPhoneNumberError("");
    }
    setPhoneNumber(inputNumber);
  };

  const submit = async (e: SyntheticEvent) => {
    e.preventDefault();

    let hasError = false;

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneNumberError("Tolong masukkan nomor handphone yang valid");
      hasError = true;
    } else {
      setPhoneNumberError("");
    }

    if (hasError) {
      return;
    }

    const fullPhoneNumber = `${selectedPrefix}${phoneNumber}`;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/forgot-password`,
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

      if (!response.ok) {
        toast({
          title: "Pemulihan Akun Gagal",
          description: "" + data.message,
          variant: "destructive",
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      setLoading(false);

      toast({
        title: "Password pemulihan sudah dikirim",
        description: "Silahkan cek WhatsApp Anda",
        duration: 5000,
      });

      setTimeout(() => {
        router.push("/auth/signin");
      }, 5000)
    } catch (error) {
      toast({
        title: "Pemulihan Akun Gagal",
        description: "" + error,
        variant: "destructive",
        duration: 5000,
      });
      setLoading(false);
    }
  };

  return (
    <NonAuth>
      <div className="max-w-signup mx-auto py-10 px-10 flex flex-col items-center justify-center min-h-screen">
        <div className="welcome-head-auth">
          <h1 className="text-2xl text-center font-semibold">Pemulihan Akun</h1>
          <p className="text-base text-center">
            Masukkan nomor handphone Anda untuk mendapatkan password pemulihan
          </p>
        </div>
        <div className="signup-content mx-auto py-16 max-w-signup w-full">
          <Toaster />
          <form onSubmit={submit}>
            <div className="form-group mb-5">
              <Label>Name</Label>
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
            </div>
            <div className="flex justify-end">
              <Button
                variant="default"
                type="submit"
                disabled={loading}
                >
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
                  "Kirim Reset Password"
                )}
                
              </Button>
            </div>
          </form>
        </div>
      </div>
    </NonAuth>
  );
};

export default Recovery;
