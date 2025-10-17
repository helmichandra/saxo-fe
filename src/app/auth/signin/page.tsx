"use client";
import React, { useState, SyntheticEvent } from "react";
import NonAuthLayout from "../../layouts/nonAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import { validatePhoneNumber } from "@/lib/form-validation";
import { useRouter } from "next/navigation";


const SignInPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const router = useRouter();

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputNumber = e.target.value;
    if (!validatePhoneNumber(inputNumber)) {
      setPhoneNumberError("Tolong masukkan nomor handphone yang valid");
    } else {
      setPhoneNumberError("");
    }
    setPhoneNumber(inputNumber);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
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

    if (!password) {
      setPasswordError("Tolong masukkan password");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) {
      return;
    }

    try {
      setLoading(true);

      document.cookie.split(";").forEach((cookie) => {
        const cookieName = cookie.split("=")[0].trim();
        document.cookie = `${cookieName}=; path=/; max-age=0`;
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            dev_chronome: "yes",
          },
          body: JSON.stringify({
            phoneNumber,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        document.cookie = `sessionId=${data.data?.sessionId}; path=/; max-age=${
          12 * 60 * 60
        }`;
        document.cookie = `roleId=${data.data?.roleId}; path=/; max-age=${
          12 * 60 * 60
        }`;
        document.cookie = `fullName=${data.data?.fullName}; path=/; max-age=${
          12 * 60 * 60
        }`;

        toast({
          title: "Login Berhasil",
          description: "Mengarahkan masuk ke dashboard...",
          duration: 3000,
        });
        router.push("/dashboard");
      } else {
        setLoading(false);
        toast({
          title: "Login Gagal",
          description: data.message || "Login failed. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error during login", error);
      setLoading(false);
      toast({
        title: "Login gagal",
        description: "An error occurred. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <NonAuthLayout>
      <div className="max-w-signup mx-auto py-10 px-10 flex flex-col items-center justify-center min-h-screen">
        <div className="welcome-head-auth">
          <h1 className="text-2xl text-center font-semibold">Masuk ke akun</h1>
          <p className="text-base text-center">
            Silahkan masukkan nomor handphone dan password
          </p>
        </div>
        <div className="sign-content mx-auto py-16 max-w-signup w-full">
          <Toaster />
          <form onSubmit={submit}>
            <div className="form-group mb-5">
              <Label>Nomor Handphone</Label>
              <Input
                type="text"
                placeholder="+62"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                autoComplete="current-phone"
                message={phoneNumberError}
              />
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                Nomor handphone tidak dapat diubah setelah pendaftaran
              </p>
            </div>
            <div className="form-group mb-5">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="[******]"
                value={password}
                onChange={handlePasswordChange}
                autoComplete="current-password"
                message={passwordError}
              />
            </div>
            <div className="forgot-password text-sm mb-3">
              <span>Lupa Password? </span>
              <small className="mt-2 text-sm text-red-600 dark:text-red-500">
                Silahkan kontak Admin untuk mengatur ulang password
              </small>
              {/* <Link
                href="/auth/recovery"
                className="text-blue-600 font-bold cursor-pointer"
              >
                Klik di sini
              </Link> */}
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" className="text-blue-600">
                <Link href="/auth/code-register">Daftar Sekarang</Link>
              </Button>
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
                  "Masuk"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </NonAuthLayout>
  );
};

export default SignInPage;
