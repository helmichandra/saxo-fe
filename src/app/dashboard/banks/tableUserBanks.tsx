"use client";
import React, { useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MoreVertical } from "lucide-react";
import { sessionId } from "@/lib/getSession";
import { UserBank } from "@/models/Interface";
import AddBank from "./addBank";
import EditBank from "./editBank";
import DeleteBank from "../users/deleteUser";
import { logout } from "@/lib/auth";

const TableUserBanks = () => {
  const [loading, setLoading] = useState(true);
  const [banks, setBanks] = useState<UserBank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<UserBank[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  async function getUserBank() {
    if (!sessionId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fiat/getUserBank`, {
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

      setBanks(data.data);
      setFilteredBanks(data.data);
    } catch (error) {
      console.error("Error fetching user banks:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getUserBank();
  }, []);

  useEffect(() => {
    const filtered = banks.filter((bank) =>
      bank.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.accountNumber.includes(searchTerm)
    );
    setFilteredBanks(filtered);
    setCurrentPage(1);
  }, [searchTerm, banks]);

  const totalPages = Math.ceil(filteredBanks.length / itemsPerPage);
  const paginatedData = filteredBanks.slice(
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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-blue-900">Bank User</CardTitle>
              <AddBank mode="user" />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Cari nama bank atau nomor rekening..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Bank</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nomor Rekening</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal Pembuatan</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dibuat Oleh</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!loading && paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Tidak ada data bank.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    paginatedData.map((bank, index) => (
                      <tr key={bank.userBankAccountId || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {index + 1 + (currentPage - 1) * itemsPerPage}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">{bank.bankName}</div>
                          <div className="text-xs text-gray-500">A/N {bank.holderName}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                          {bank.accountNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(bank.createdDate).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {bank.createdBy}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              bank.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {bank.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                              <MoreVertical className="h-5 w-5 text-gray-600" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <EditBank mode="user" bank={bank} />
                              <DeleteBank
                                mode="user"
                                bank={{
                                  userBankAccountId: bank.userBankAccountId,
                                  bankName: bank.bankName,
                                }}
                              />
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            
            {!loading && filteredBanks.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredBanks.length)} dari {filteredBanks.length} data
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={handlePreviousPage}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = index + 1;
                        } else if (currentPage <= 3) {
                          pageNum = index + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + index;
                        } else {
                          pageNum = currentPage - 2 + index;
                        }
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              isActive={pageNum === currentPage}
                              onClick={() => handlePageClick(pageNum)}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={handleNextPage}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TableUserBanks;