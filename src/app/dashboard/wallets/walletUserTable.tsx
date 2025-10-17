"use client";

import React, { useEffect, useState } from "react";
import { CryptoWallet } from "@/models/Interface";
import { sessionId } from "@/lib/getSession";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import EditUserWallet from "./editUserWallet";
import ViewUserWallet from "./viewUserWallet";
import { logout } from "@/lib/auth";

const WalletsUserTable = () => {
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [filteredWallets, setFilteredWallets] = useState<CryptoWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trade/wallet-user-list`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            dev_chronome: "yes",
            authorization: `${sessionId}`,
          },
        });

      if (response.status === 401) {
        console.warn("Unauthorized. Logging out...");
        logout();
        return;
      }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message);
        }

        setWallets(data.data);
        setFilteredWallets(data.data);
      } catch (error) {
        console.error("Failed to fetch wallets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, []);

  useEffect(() => {
    const filtered = wallets.filter(
      (wallet) =>
        wallet.cryptoWalletId.includes(searchTerm) ||
        wallet.t.coinName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.t.coinCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWallets(filtered);
    setCurrentPage(1);
  }, [searchTerm, wallets]);

  const totalPages = Math.ceil(filteredWallets.length / itemsPerPage);
  const currentItems = filteredWallets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageClick = (page: number) => setCurrentPage(page);
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <>
      <div className="pb-10">
        <div className="p-[11px] border border-gray-300 rounded-lg bg-white">
          <div className="flex justify-between items-center py-5">
            <h2 className="text-lg font-bold">List Wallet User</h2>
            <Input
              type="search"
              placeholder="Search by ID, coin name, or coin code"
              className="max-w-[494px] w-full"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full py-5">
              <thead>
                <tr>
                  <th className="w-fit border-t border-b p-4 text-left">#</th>
                  <th className="w-fit border-t border-b p-4 text-left">Wallet ID</th>
                  <th className="w-fit border-t border-b p-4 text-left">Nama Lengkap</th>
                  <th className="w-fit border-t border-b p-4 text-left">Nama Koin</th>
                  <th className="w-fit border-t border-b p-4 text-left">Jumlah</th>
                  <th className="w-fit border-t border-b p-4 text-left">Tanggal Update</th>
                  <th className="w-fit border-t border-b p-4 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center">
                      No wallets found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((wallet, index) => (
                    <tr key={wallet.cryptoWalletId}>
                      <td className="p-4 align-middle border-t border-b">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </td>
                      <td className="p-4 align-middle border-t border-b">{wallet.cryptoWalletId}</td>
                      <td className="p-4 align-middle capitalize border-t border-b">{wallet.user.fullName}</td>
                      <td className="p-4 align-middle border-t border-b">{wallet.t.coinName}</td>
                      <td className="p-4 align-middle border-t border-b">{wallet.balance}</td>
                      <td className="p-4 align-middle border-t border-b">{wallet.modifiedDate}</td>
                      <td className="p-4 align-middle border-t border-b">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="font-bold w-full">...</DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <ViewUserWallet wallet={wallet} />
                                <EditUserWallet wallet={wallet} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="py-5">
            <Pagination className="justify-start">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={handlePreviousPage} />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      isActive={index + 1 === currentPage}
                      onClick={() => handlePageClick(index + 1)}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext onClick={handleNextPage} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletsUserTable;
