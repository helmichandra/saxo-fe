"use client";

import React, { useEffect, useState } from "react";
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
import EditUserFiat from "./editUserFiat";
import { FiatsTransaction } from "@/models/Interface";
import ViewUserFiat from "./viewUserFiat";
import { logout } from "@/lib/auth";

const FiatsUserTable = () => {
  const [fiatWallets, setFiatWallets] = useState<FiatsTransaction[]>([]);
  const [filteredWallets, setFilteredWallets] = useState<FiatsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchFiatWallets = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/fiat/admin/fiat-balance-listing-users`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              dev_chronome: "yes",
              authorization: `${sessionId}`,
            },
          }
        );

      if (response.status === 401) {
        console.warn("Unauthorized. Logging out...");
        logout();
        return;
      }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message);
        }

        setFiatWallets(data.data);
        setFilteredWallets(data.data);
      } catch (error) {
        console.error("Failed to fetch fiat wallets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiatWallets();
  }, []);

  useEffect(() => {
    const filtered = fiatWallets.filter(
      (wallet) =>
        wallet.fiatWalletId.includes(searchTerm) ||
        wallet.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWallets(filtered);
    setCurrentPage(1);
  }, [searchTerm, fiatWallets]);

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
            <h2 className="text-lg font-bold">List Fiat Wallet Member</h2>
            {/* <div className="max-w-[320px] w-full"> */}
            <Input
              type="search"
              placeholder="Search by Wallet ID or User Name"
              className="max-w-[494px] w-full"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {/* </div> */}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full py-5">
              <thead>
                <tr>
                  <th className="w-fit border-t border-b p-4 text-left">#</th>
                  <th className="w-fit border-t border-b p-4 text-left">Fiat Wallet ID</th>
                  <th className="w-fit border-t border-b p-4 text-left">Nama Lengkap</th>
                  <th className="w-fit border-t border-b p-4 text-left">Saldo</th>
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
                      No fiat wallets found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((wallet, index) => (
                    <tr key={wallet.fiatWalletId}>
                      <td className="p-4 align-middle border-t border-b">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </td>
                      <td className="p-4 align-middle border-t border-b">{wallet.fiatWalletId}</td>
                      <td className="p-4 align-middle capitalize border-t border-b">
                        {wallet.user.fullName}
                      </td>
                      <td className="p-4 align-middle border-t border-b">
                        Rp {wallet.balance.toLocaleString()}
                      </td>
                      <td className="p-4 align-middle border-t border-b">
                        {wallet.modifiedDate}
                      </td>
                      <td className="p-4 align-middle border-t border-b">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="font-bold w-full">...</DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <ViewUserFiat wallet={wallet} />
                              <EditUserFiat wallet={wallet} />
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

export default FiatsUserTable;
