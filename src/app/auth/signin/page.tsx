"use client";

import React, { SyntheticEvent, useState } from "react";

import NonAuthLayout from "../../layouts/nonAuth";

import { useRouter } from "next/router";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

import { useToast } from "@/hooks/use-toast";

import { validatePhoneNumber } from "@/lib/form-validation";

const SignInPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const router = useRouter();

  const handlePhoneNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputNumber = e.target.value;

    if (!validatePhoneNumber(inputNumber)) {
      setPhoneNumberError(
        "Tolong masukkan nomor handphone yang valid"
      );
    } else {
      setPhoneNumberError("");
    }

    setPhoneNumber(inputNumber);
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPassword(e.target.value);

    if (!e.target.value) {
      setPasswordError("Tolong masukkan password");
    } else {
      setPasswordError("");
    }
  };

  const submit = async (e: SyntheticEvent) => {
    e.preventDefault();

    let hasError = false;

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneNumberError(
        "Tolong masukkan nomor handphone yang valid"
      );

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

      // hapus semua cookie lama
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

      if (!response.ok) {
        toast({
          title: "Login Gagal",
          description:
            data.message ||
            "Login gagal. Silahkan coba lagi.",
          variant: "destructive",
          duration: 5000,
        });

        return;
      }

      document.cookie = `sessionId=${
        data.data?.sessionId
      }; path=/; max-age=${12 * 60 * 60}`;

      document.cookie = `roleId=${
        data.data?.roleId
      }; path=/; max-age=${12 * 60 * 60}`;

      document.cookie = `fullName=${
        data.data?.fullName
      }; path=/; max-age=${12 * 60 * 60}`;

      toast({
        title: "Login Berhasil",
        description: "Mengarahkan ke dashboard...",
        duration: 3000,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error during login", error);

      toast({
        title: "Login Gagal",
        description:
          "Terjadi kesalahan. Silahkan coba lagi nanti.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <NonAuthLayout>
      <div className="max-w-signup mx-auto py-10 px-10 flex flex-col items-center justify-center min-h-screen">
        <div className="welcome-head-auth">
          <h1 className="text-2xl text-center font-semibold">
            Masuk ke akun
          </h1>

          <p className="text-base text-center">
            Silahkan masukkan nomor handphone dan
            password
          </p>
        </div>

        <div className="sign-content mx-auto py-16 max-w-signup w-full">
          <Toaster />

          <form onSubmit={submit}>
            <div className="form-group mb-5">
              <Label>
                Nomor Handphone{" "}
                <span className="text-red-500">*</span>
              </Label>

              <Input
                type="text"
                placeholder="+62812345678"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                autoComplete="tel"
                className="mt-2"
              />

              {phoneNumberError && (
                <p className="mt-1 text-sm text-red-500">
                  {phoneNumberError}
                </p>
              )}

              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                Nomor handphone tidak dapat diubah setelah
                pendaftaran
              </p>
            </div>

            <div className="form-group mb-5">
              <Label>
                Password{" "}
                <span className="text-red-500">*</span>
              </Label>

              <Input
                type="password"
                placeholder="******"
                value={password}
                onChange={handlePasswordChange}
                autoComplete="current-password"
                className="mt-2"
              />

              {passwordError && (
                <p className="mt-1 text-sm text-red-500">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="forgot-password text-sm mb-3">
              <span>Lupa Password? </span>

              <small className="text-sm text-red-600 dark:text-red-500">
                Silahkan kontak Admin untuk mengatur ulang
                password
              </small>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                className="text-blue-600"
              >
                <a href="/auth/code-register">
                  Daftar Sekarang
                </a>
              </Button>

              <Button
                variant="default"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span>Loading</span>

                    <svg
                      aria-hidden="true"
                      role="status"
                      className="inline w-4 h-4 ml-2 text-white animate-spin"
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
