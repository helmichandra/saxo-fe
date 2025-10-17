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
    <div>
      <div className="pb-10 pt-5">
        <div className="p-[11px] border border-gray-300 rounded-lg bg-white">
          <AddBank mode="user" />
          <div className="flex justify-between items-center py-5">
            <h2 className="text-lg font-bold">Bank User</h2>
              <Input
                type="search"
                placeholder="Search by Bank Name or Account Number"
                className="max-w-[300px]"
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
                  <th className="w-fit border-t border-b px-6 py-4 text-left">Dibuat Oleh</th>
                  <th className="w-fit border-t border-b px-6 py-4 text-left">Status</th>
                  <th className="w-fit border-t border-b px-6 py-4 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      Tidak ada data bank.
                    </td>
                  </tr>
                )}
                {!loading &&
                  paginatedData.map((bank, index) => (
                    <tr key={bank.userBankAccountId || index}>
                      <td className="px-6 py-4 align-middle border-t border-b">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </td>
                      <td className="px-6 py-4 align-middle border-t border-b">
                        (A/N {bank.holderName})
                        <br />
                        {bank.bankName}
                      </td>
                      <td className="px-6 py-4 align-middle border-t border-b">
                        {bank.accountNumber}
                      </td>
                      <td className="px-6 py-4 align-middle border-t border-b">
                        {new Date(bank.createdDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 align-middle border-t border-b">
                        {bank.createdBy}
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
                        <DropdownMenu>
                          <DropdownMenuTrigger className="font-bold w-full">
                            ...
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
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

export default TableUserBanks;
