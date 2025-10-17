"use client";
import React, { useEffect, useState } from "react";
import { CryptoWallet } from "@/models/Interface";
import ViewTransaction from "./viewTransaction";
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
import { logout } from "@/lib/auth";

export default function WalletTable() {
  const [transactions, setTransactions] = useState<CryptoWallet[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<CryptoWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trade/exchange-list`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            dev_chronome: "yes",
            authorization: `${sessionId}`,
          },
        });

      if (response.status === 401) {
        console.warn("Unauthorized. Redirecting...");
        logout();
        return;
      }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message);
        }

        setTransactions(data.data);
        setFilteredTransactions(data.data); 
      } catch (error) {
        console.error("Failed to fetch exchange transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  
  useEffect(() => {
    const filtered = transactions.filter(
      (transaction) =>
        transaction.tradingId.includes(searchTerm) ||
        transaction.cryptocurrencyType.coinName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTransactions(filtered);
    setCurrentPage(1); 
  }, [searchTerm, transactions]);

  
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentItems = filteredTransactions.slice(
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
    <div className="pb-10">
      <div className="p-[11px] border border-gray-300 rounded-lg bg-white">
        <div className="flex justify-between items-center py-5">
          <h2 className="text-lg font-bold">Riwayat Transaksi Crypto</h2>
          <Input
            type="search"
            placeholder="Search by ID, coin name, or type"
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
                <th className="w-fit border-t border-b p-4 text-left">Nomor Transaksi</th>
                <th className="w-fit border-t border-b p-4 text-left">Nama Koin</th>
                <th className="w-fit border-t border-b p-4 text-left">Jumlah Koin</th>
                <th className="w-fit border-t border-b p-4 text-left">Tipe Transaksi</th>
                <th className="w-fit border-t border-b p-4 text-left">Tanggal Transaksi</th>
                <th className="w-fit border-t border-b p-4 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                currentItems.map((transaction, index) => (
                  <tr key={transaction.tradingId}>
                    <td className="p-4 align-middle border-t border-b">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                    <td className="p-4 align-middle border-t border-b">{transaction.tradingId}</td>
                    <td className="p-4 align-middle border-t border-b">{transaction.cryptocurrencyType.coinName}</td>
                    <td className="p-4 align-middle border-t border-b">{transaction.coinAmount}</td>
                    <td className="p-4 align-middle border-t border-b">{transaction.type}</td>
                    <td className="p-4 align-middle border-t border-b">{transaction.createdDate}</td>
                    <td className="p-4 align-middle border-t border-b">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="font-bold w-full">...</DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <ViewTransaction transactionWallet={transaction} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
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
  );
}
