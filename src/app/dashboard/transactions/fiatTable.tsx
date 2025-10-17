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
import ViewTransaction from "./viewTransaction";
import { FiatsTransaction } from "@/models/Interface";
import { Input } from "@/components/ui/input";
import { sessionId } from "@/lib/getSession";
import { logout } from "@/lib/auth";

async function getFiatTransactions(): Promise<FiatsTransaction[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fiat/getRequestList`, {
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
    return[];
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

  return (
    <div className="pb-10">
      <div className="p-[11px] border border-gray-300 rounded-lg bg-white">
        <div className="flex justify-between items-center py-5">
          <h2 className="text-lg font-bold">Riwayat Transaksi Fiat</h2>
          <Input
            type="search"
            placeholder="Cari Nomor atau Tipe Transaksi"
            className="max-w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full py-5">
            <thead>
              <tr>
                <th className="w-fit border-t border-b p-4 text-left">#</th>
                <th className="w-fit border-t border-b p-4 text-left">Nomor Transaksi</th>
                <th className="w-fit border-t border-b p-4 text-left">Jumlah Transaksi</th>
                <th className="w-fit border-t border-b p-4 text-left">Tipe Transaksi</th>
                <th className="w-fit border-t border-b p-4 text-left">Tanggal Transaksi</th>
                <th className="w-fit border-t border-b p-4 text-left">Status</th>
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
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center">
                    Tidak ada data yang ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedData.map((fiat, index) => (
                  <tr key={fiat.transactionId}>
                    <td className="p-4 align-middle border-t border-b">
                      <p>{index + 1 + (currentPage - 1) * itemsPerPage}</p>
                    </td>
                    <td className="p-4 align-middle border-t border-b">
                      <p>{fiat.transactionId}</p>
                    </td>
                    <td className="p-4 align-middle border-t border-b">
                      <p>Rp {Number(fiat.amount.toFixed(2)).toLocaleString()}</p>
                    </td>
                    <td className="p-4 align-middle border-t border-b">
                      <p className="capitalize">{fiat.transactionType}</p>
                    </td>
                    <td className="p-4 align-middle border-t border-b">
                      <p>{fiat.date}</p>
                    </td>
                    <td className="p-4 align-middle border-t border-b">
                      <p
                        className={`capitalize p-1 border rounded-full text-center ${
                          fiat.status === 0
                            ? "border-orange-500 text-orange-500"
                            : fiat.status === 1
                            ? "border-green-500 text-green-500"
                            : "border-red-500 text-red-500"
                        }`}
                      >
                        {fiat.status === 0
                          ? "Pending"
                          : fiat.status === 1
                          ? "Approve"
                          : "Decline"}
                      </p>
                    </td>
                    <td className="p-4 align-middle border-t border-b">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="font-bold w-full">
                          ...
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <ViewTransaction transactionFiat={fiat} />
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
                <PaginationPrevious href="#" onClick={handlePreviousPage} />
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
                <PaginationNext href="#" onClick={handleNextPage} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
