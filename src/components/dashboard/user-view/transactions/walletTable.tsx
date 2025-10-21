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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreVertical, Search } from "lucide-react";
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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/trade/exchange-list`,
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
        transaction.cryptocurrencyType.coinName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
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
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Riwayat Transaksi Crypto</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Daftar transaksi cryptocurrency
          </p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari ID, coin, atau tipe..."
            className="pl-9 w-full sm:w-[300px]"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Nomor Transaksi</TableHead>
                  <TableHead>Nama Koin</TableHead>
                  <TableHead>Jumlah Koin</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Tidak ada transaksi ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((transaction, index) => (
                    <TableRow key={transaction.tradingId}>
                      <TableCell className="font-medium">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.tradingId}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {transaction.cryptocurrencyType.coinName}
                      </TableCell>
                      <TableCell className="font-mono">
                        {transaction.coinAmount}
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{transaction.type}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {transaction.createdDate}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <ViewTransaction transactionWallet={transaction} />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={handlePreviousPage}
                      className={
                        currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        isActive={index + 1 === currentPage}
                        onClick={() => handlePageClick(index + 1)}
                        className="cursor-pointer"
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={handleNextPage}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </Card>
  );
}