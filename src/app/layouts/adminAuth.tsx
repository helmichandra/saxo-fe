"use client";

export const dynamic = "force-dynamic";

import React, {
  PropsWithChildren,
  useEffect,
  useState,
  useCallback,
} from "react";

import { Button } from "@/components/ui/button";

import Link from "next/link";

import { useRouter } from "next/router";

import { getCookie, logout } from "@/lib/auth";

const AdminAuth = ({
  children,
}: PropsWithChildren) => {
  const router = useRouter();

  const [roleName, setRoleName] =
    useState("");

  const [currentRoleId, setCurrentRoleId] =
    useState("");

  const [currentFullName, setCurrentFullName] =
    useState("");

  const updateRoleAndSession =
    useCallback(() => {
      const sessionId =
        getCookie("sessionId");

      const roleId =
        getCookie("roleId");

      const fullName =
        getCookie("fullName");

      if (!sessionId) {
        router.push("/auth/signin");
        return;
      }

      setCurrentRoleId(roleId || "");

      setCurrentFullName(fullName || "");

      switch (roleId) {
        case "777":
          setRoleName("Super Admin");
          break;

        case "555":
          setRoleName("Admin");
          break;

        default:
          setRoleName("Member");
      }
    }, [router]);

  useEffect(() => {
    updateRoleAndSession();

    const interval = setInterval(
      updateRoleAndSession,
      60000
    );

    return () => clearInterval(interval);
  }, [updateRoleAndSession]);

  return (
    <div>
      <header className="mb-2.5 sticky top-0 z-50 bg-[#aff0ee]">
        <div className="header-wrap p-4 border-b border-gray-200">
          <nav className="max-w-container mx-auto flex items-start md:items-center justify-between flex-wrap flex-col-reverse md:flex-row gap-4 md:gap-0">

            {/* LEFT */}

            <div className="flex flex-wrap items-center gap-5 md:gap-0">

              {/* LOGO */}

              <Link
                href="/"
                className="cursor-pointer hidden md:block"
              >
                <img
                  src="/image/logo.png"
                  alt="Saxo Crypto"
                  className="w-[94px] h-auto object-contain"
                />
              </Link>

              {currentRoleId === "1" && (
                <div className="ps-0 md:ps-7">
                  <Link
                    className="text-gray-700 hover:text-blue-500"
                    href="/dashboard/markets"
                  >
                    Market
                  </Link>
                </div>
              )}

              {currentRoleId === "1" && (
                <div className="ps-0 md:ps-7">
                  <Link
                    className="text-gray-700 hover:text-blue-500"
                    href="/dashboard/transactions"
                  >
                    Transaksi
                  </Link>
                </div>
              )}

              {currentRoleId === "1" && (
                <div className="ps-0 md:ps-7">
                  <Link
                    className="text-gray-700 hover:text-blue-500"
                    href="/dashboard/portofolios"
                  >
                    Portofolio
                  </Link>
                </div>
              )}

              <div className="ps-0 md:ps-7">
                <Link
                  className="text-gray-700 hover:text-blue-500"
                  href="/dashboard/requests"
                >
                  Permintaan
                </Link>
              </div>

              <div className="ps-0 md:ps-7">
                <Link
                  className="text-gray-700 hover:text-blue-500"
                  href="/dashboard/banks"
                >
                  Bank
                </Link>
              </div>

              {(currentRoleId === "777" ||
                currentRoleId === "555") && (
                <div className="ps-0 md:ps-7">
                  <Link
                    className="text-gray-700 hover:text-blue-500"
                    href="/dashboard/wallets"
                  >
                    Dompet User
                  </Link>
                </div>
              )}

              {(currentRoleId === "777" ||
                currentRoleId === "555") && (
                <div className="ps-0 md:ps-7">
                  <Link
                    className="text-gray-700 hover:text-blue-500"
                    href="/dashboard/users"
                  >
                    Pengguna
                  </Link>
                </div>
              )}
            </div>

            {/* RIGHT */}

            <div className="flex items-center space-x-4 justify-between w-full md:w-fit md:justify-start">
              <div className="font-semibold">
                <div>{currentFullName}</div>

                <div className="text-sm text-gray-500">
                  {roleName || "Role Name"}
                </div>
              </div>

              <Link href="/auth/signin">
                <Button
                  onClick={logout}
                  variant="default"
                >
                  Keluar
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="max-w-container mx-auto px-10">
        {children}
      </div>
    </div>
  );
};

export default AdminAuth;