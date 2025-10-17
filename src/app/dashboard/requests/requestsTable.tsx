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
import { Input } from "@/components/ui/input";
import AddRequest from "./addRequests";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FiatsTransaction } from "@/models/Interface";
import { roleId, sessionId } from "@/lib/getSession";
import ViewTransaction from "../transactions/viewTransaction";
import ApproveRequest from "./approveRequest";
import RejectRequest from "./rejectRequest";
import { logout } from "@/lib/auth";

async function fetchRequestTables(): Promise<FiatsTransaction[]> {
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

export default function RequestTable() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FiatsTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  useEffect(() => {
    async function fetchRequests() {
      if (!sessionId) return;
      try {
        setLoading(true);
        const requests = await fetchRequestTables();
        setData(requests);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

  const filteredData = data.filter((request) =>
    request.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageClick = (page: number) => setCurrentPage(page);
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="pb-10 pt-5">
      <div className="p-[11px] border border-gray-300 rounded-lg bg-white">
        {roleId === "1" && <AddRequest />}
        <div className="flex justify-between items-center py-5">
          <h2 className="text-lg font-bold">List Permintaan</h2>
          <Input
            type="search"
            placeholder="Search by Transaction ID"
            className="max-w-[300px]"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full py-5">
            <thead>
              <tr>
                <th className="w-fit border-t border-b px-6 py-4 text-left">#</th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">
                  Nomor Transaksi
                </th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">
                  Jumlah
                </th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">
                  Tipe Transaksi
                </th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">Tanggal</th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">
                  Status
                </th>
                <th className="w-fit border-t border-b px-6 py-4 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    No requests found.
                  </td>
                </tr>
              ) : (
                currentItems.map((request, index) => (
                  <tr key={request.transactionId}>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <p>{index + 1 + (currentPage - 1) * itemsPerPage}</p>
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <p>{request.transactionId}</p>
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <p>Rp {Number(request.amount.toFixed(2)).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <p className="capitalize">{request.transactionType}</p>
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <p>{request.date}</p>
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <p
                        className={`capitalize p-1 border rounded-full text-center ${
                          request.status === 0
                            ? "border-orange-500 text-orange-500"
                            : request.status === 1
                            ? "border-green-500 text-green-500"
                            : "border-red-500 text-red-500"
                        }`}
                      >
                        {request.status === 0
                          ? "Pending"
                          : request.status === 1
                          ? "Approve"
                          : "Decline"}
                      </p>
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="font-bold w-full">
                            ...
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <ViewTransaction transactionFiat={request} />
                            {(roleId === "777" || roleId === "555") && request.status === 0 && (
                              <>
                                <ApproveRequest request={request} />
                                <RejectRequest request={request} />
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
