"use client";
import React, { SyntheticEvent, useEffect, useState } from "react";
import NonAuth from "@/app/layouts/nonAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
} from "@/lib/form-validation";
import { PhonePrefix } from "@/models/Interface";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SignUpPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registeredCode, setRegisteredCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [registeredCodeError, setRegisteredCodeError] = useState("");
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

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFullName = e.target.value;

    if (inputFullName.trim() === "") {
      setFullNameError("Tolong masukkan nama lengkap anda");
    } else {
      setFullNameError("");
    }

    setFullName(inputFullName);
  };

  const handleEmailchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEmail = e.target.value;

    if (!validateEmail(inputEmail)) {
      setEmailError("Tolong masukkan email yang valid");
    } else {
      setEmailError("");
    }

    setEmail(inputEmail);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputPassword = e.target.value;

    if (!validatePassword(inputPassword)) {
      setPasswordError("Tolong masukkan password yang valid");
    } else {
      setPasswordError("");
    }
    setPassword(inputPassword);
  };

  const handleRegisteredCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputRegisteredCode = e.target.value;

    if (inputRegisteredCode.trim() === "") {
      setRegisteredCodeError("Tolong masukkan kode verifikasi");
    } else {
      setRegisteredCodeError("");
    }
    setRegisteredCode(inputRegisteredCode);
  };

  const submit = async (e: SyntheticEvent) => {
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

    if (!validatePassword(password)) {
      setPasswordError("Tolong masukkan password yang valid");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (registeredCode.trim() === "") {
      setRegisteredCodeError("Tolong masukkan kode verifikasi");
      hasError = true;
    } else {
      setRegisteredCodeError("");
    }

    if (hasError) {
      return;
    }
    const fullPhoneNumber = `${selectedPrefix}${phoneNumber}`;
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/registration/user-reg`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            dev_chronome: "yes",
          },
          body: JSON.stringify({
            userFullName: fullName,
            phoneNumber: fullPhoneNumber.replace("+", ""),
            passwordRegister: password,
            invitationCode: registeredCode,
            email: email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Registrasi Gagal",
          description: data.message,
          variant: "destructive",
          duration: 5000,
        });
        setLoading(false);
        router.refresh();
        return;
      }

      toast({
        title: `Registrasi berhasil`,
        description: `Anda akan diarahkan ke halaman login dalam 5 detik`,
        duration: 5000,
      });
      setLoading(false);
      setTimeout(() => router.push("/auth/signin"), 5000);
    } catch (error) {
      router.refresh();
      setLoading(false);
      console.error("Error sending code", error);
      toast({
        title: "Registrasi gagal",
        description: "" + error,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <NonAuth>
      <div className="max-w-signup mx-auto py-10 px-10 flex flex-col items-center justify-center min-h-screen">
        <div className="welcome-head-auth">
          <h1 className="text-2xl text-center font-semibold">Register</h1>
          <p className="text-base text-center">
            Registrasi data Anda untuk keperluan data pribadi Anda
          </p>
        </div>
        <div className="sign-content mx-auto py-16 max-w-signup w-full">
          <Toaster />
          <form onSubmit={submit}>
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
              {/* <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                Nomor handphone tidak dapat diubah setelah pendaftaran
              </p> */}
            </div>
            <div className="form-group mb-5">
              <Label required>Kode Register</Label>
              <Input
                type="name"
                placeholder="Kode Register"
                required
                value={registeredCode}
                onChange={handleRegisteredCodeChange}
                message={registeredCodeError}
              />
            </div>
            <div className="form-group mb-5">
              <Label required>Nama Lengkap</Label>
              <Input
                type="name"
                placeholder="Full Name"
                required
                value={fullName}
                onChange={handleFullNameChange}
                message={fullNameError}
              />
            </div>
            <div className="form-group mb-5">
              <Label required>Email</Label>
              <Input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={handleEmailchange}
                message={emailError}
              />
            </div>
            <div className="form-group mb-5">
              <Label required>Password</Label>
              <Input
                type="password"
                placeholder="[******]"
                required
                value={password}
                onChange={handlePasswordChange}
                message={passwordError}
              />
              <div className="mt-2">
                <p className="text-sm font-bold text-gray-500">
                  Password harus
                </p>
                <ul className="text-sm list-disc ps-5 text-gray-500">
                  <li>
                    Harus memiliki <strong>lebih dari 6 karakter</strong>
                  </li>
                  <li>
                    Wajib menyertakan minimal <strong>satu simbol</strong>
                  </li>
                  <li>
                    Harus mengandung setidkanya{" "}
                    <strong>satu huruf besar</strong>
                  </li>
                </ul>
              </div>
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
    </NonAuth>
  );
};

export default SignUpPage;
