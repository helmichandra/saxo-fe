"use client";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { sessionId } from "@/lib/getSession";
import { Bank } from "@/models/Interface";
import AddBank from "./addBank";
import EditBank from "./editBank";
import { logout } from "@/lib/auth";

const TableBanks = () => {
  const [loading, setLoading] = useState(true);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchBanks = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fiat/getBank`, {
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
      if (!response.ok) throw new Error(data.message);

      setBanks(data.data);
      setFilteredBanks(data.data);
    } catch (error) {
      console.error("Error fetching banks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBanks();
  }, []);
  useEffect(() => {
    const filtered = banks.filter(
      (bank) =>
        bank.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.accountNumber.includes(searchTerm)
    );
    setFilteredBanks(filtered);
    setCurrentPage(1); 
  }, [searchTerm, banks]);

  const totalPages = Math.ceil(filteredBanks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBanks = filteredBanks.slice(startIndex, startIndex + itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="pb-10 pt-5">
        <div className="p-[11px] border border-gray-300 rounded-lg bg-white">
          <AddBank mode="company" />
          <div className="flex justify-between items-center py-5">
            <h2 className="text-lg font-bold">Bank Perusahaan</h2>
            <Input
              type="search"
              placeholder="Search by Bank Name or Account Number"
              className="max-w-[494px] w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full py-5">
              <thead>
                <tr>
                  <th className="w-fit border-t border-b px-6 py-4 text-left">#</th>
                  <th className="w-fit border-t border-b px-6 py-4 text-left">Nama Bank</th>
                  <th className="w-fit border-t border-b px-6 py-4 text-left">Nomor Rekening</th>
                  <th className="w-fit border-t border-b px-6 py-4 text-left">Tanggal Pembuatan</th>
                  <th className="w-fit border-t border-b px-6 py-4 text-left">Status</th>
                  <th className="w-fit border-t border-b px-6 py-4 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && paginatedBanks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      No banks found.
                    </td>
                  </tr>
                )}
                {paginatedBanks.map((bank, index) => (
                  <tr key={bank.bankId}>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <p>{startIndex + index + 1}</p>
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <p className="capitalize">{bank.bankName}</p>
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <p>{bank.accountNumber}</p>
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <p>{bank.createdDate}</p>
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <p
                        className={`border rounded-full p-1 text-center ${
                          bank.isActive
                            ? "text-green-500 border-green-500"
                            : "text-red-500 border-red-500"
                        }`}
                      >
                        {bank.isActive ? "Active" : "Inactive"}
                      </p>
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="font-bold w-full">...</DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <EditBank mode="company" bank={bank} />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
};

export default TableBanks;
