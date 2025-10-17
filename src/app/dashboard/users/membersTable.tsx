"use client";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { MembersResponse } from "@/models/Interface";
import { getCookie, logout } from "@/lib/auth";
import SendWa from "./sendWa";

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

const sessionId = getCookie("sessionId");

export default function MembersTable() {
  const [members, setMembers] = useState<MembersResponse["data"]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MembersResponse["data"]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/admin/users/temp/getList`,
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
          throw new Error(data.message || "Failed to fetch members.");
        }

        setMembers(data.data);
        setFilteredMembers(data.data);
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    const filtered = members.filter(
      (member) =>
        member.phoneNoReg.includes(searchTerm) ||
        (member.registrationCodeTemp &&
          member.registrationCodeTemp.includes(searchTerm)) ||
        member.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
    setCurrentPage(1);
  }, [searchTerm, members]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const currentItems = filteredMembers.slice(
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
    <div className="pb-10 pt-5">
      <div className="p-[11px] border border-gray-300 rounded-lg bg-white">
        <div className="flex justify-between items-center py-5">
          <h2 className="text-lg font-bold">Daftar Calon Member</h2>
          <Input
            type="search"
            placeholder="Search by phone, code, or creator"
            className="max-w-[494px] w-full"
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
                  Nomor Handphone
                </th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">
                  Kode Registrasi
                </th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">
                  Dibuat oleh
                </th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">
                  Dimodifikasi oleh
                </th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">
                  Tanggal Pembuatan
                </th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">
                  Tanggal Modifikasi
                </th>
                <th className="w-fit border-t border-b px-6 py-4 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && currentItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    No members found.
                  </td>
                </tr>
              )}
              {currentItems.map((member, index) => (
                <tr key={member.phoneNoReg}>
                  <td className="px-6 py-4 align-middle border-t border-b">
                    <p>{index + 1 + (currentPage - 1) * itemsPerPage}</p>
                  </td>
                  <td className="px-6 py-4 align-middle border-t border-b">
                    <p>{member.phoneNoReg}</p>
                  </td>
                  <td className="px-6 py-4 align-middle border-t border-b">
                    <p>{member.registrationCodeTemp || "N/A"}</p>
                  </td>
                  <td className="px-6 py-4 align-middle border-t border-b">
                    <p>{member.createdBy}</p>
                  </td>
                  <td className="px-6 py-4 align-middle border-t border-b">
                    <p>{member.modifiedBy}</p>
                  </td>
                  <td className="px-6 py-4 align-middle border-t border-b">
                    <p>{new Date(member.createdDate).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 align-middle border-t border-b">
                    <p>{new Date(member.modifiedDate).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 align-middle border-t border-b">
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="font-bold w-full">
                          ...
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <SendWa {...member} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
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
