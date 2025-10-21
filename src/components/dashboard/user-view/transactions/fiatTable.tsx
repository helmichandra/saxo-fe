"use client";
import React, { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import ViewTransaction from "./viewTransaction";
import { FiatsTransaction } from "@/models/Interface";
import { sessionId } from "@/lib/getSession";
import { logout } from "@/lib/auth";

async function getFiatTransactions(): Promise<FiatsTransaction[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/fiat/getRequestList`,
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
    return [];
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data.data;
}

export default function FiatTable() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FiatsTransaction[]>([]);
  const [filteredData, setFilteredData] = useState<FiatsTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const transactions = await getFiatTransactions();
        setData(transactions);
        setFilteredData(transactions);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  useEffect(() => {
    const filtered = data.filter(
      (fiat) =>
        fiat.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fiat.transactionType.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, data]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePageClick = (page: number) => setCurrentPage(page);

  const getStatusBadge = (status: number) => {
    if (status === 0) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-500">
          Pending
        </Badge>
      );
    } else if (status === 1) {
      return (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Approved
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-red-500 text-red-500">
          Declined
        </Badge>
      );
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Riwayat Transaksi Fiat</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Daftar transaksi deposit dan withdraw
          </p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari Nomor atau Tipe..."
            className="pl-9 w-full sm:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Tidak ada data yang ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((fiat, index) => (
                    <TableRow key={fiat.transactionId}>
                      <TableCell className="font-medium">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {fiat.transactionId}
                      </TableCell>
                      <TableCell className="font-mono">
                        Rp {Number(fiat.amount.toFixed(2)).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{fiat.transactionType}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {fiat.date}
                      </TableCell>
                      <TableCell>{getStatusBadge(fiat.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <ViewTransaction transactionFiat={fiat} />
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