"use client";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
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
import { getCookie, logout } from "@/lib/auth";
import ViewAdmin from "./viewAdmin";
import EditAdmin from "./editAdmin";
import { AdminResponse, AdminData } from "@/models/Interface";
import AddUser from "./addUser";
import ResetPassword from "./resetPassword";

export default function AdminsTable() {
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  async function getAdmins(): Promise<AdminResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/superadmin/admin-list`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: getCookie("sessionId") || "",
        },
        body: JSON.stringify({
          page: 1,
          limit: 1000,
        }),
      }
    );

    if (response.status === 401) {
      console.warn("Unauthorized. Redirecting...");
      logout();
      return { data: [], total: 0, totalPage: 0 };
    }

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  }

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const data = await getAdmins();
        setAdmins(data.data);
        setFilteredAdmins(data.data); 
      } catch (error) {
        console.error("Failed to fetch admins:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  
  useEffect(() => {
    const filtered = admins.filter(
      (admin) =>
        admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.phoneNumber.includes(searchTerm) ||
        admin.userNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAdmins(filtered);
    setCurrentPage(1); 
  }, [searchTerm, admins]);

  
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const currentItems = filteredAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageClick = (page: number) => setCurrentPage(page);
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="pb-10 pt-5">
      <div className="p-[11px] border border-gray-300 rounded-lg bg-white">
        <AddUser isAdminTable={true} />
        <div className="flex justify-between items-center py-5">
          <h2 className="text-lg font-bold">Daftar User Admin dan Super Admin</h2>
          <Input
            type="search"
            placeholder="Search"
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
                <th className="w-fit border-t border-b px-6 py-4 text-left">Nama Lengkap</th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">Email</th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">Nomor Handphone</th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">Status</th>
                <th className="w-fit border-t border-b px-6 py-4 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    No admins found.
                  </td>
                </tr>
              ) : (
                currentItems.map((admin, index) => (
                  <tr key={admin.userId}>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      {index + 1 + (currentPage - 1) * itemsPerPage}
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      {admin.fullName}
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      {admin.phoneNumber}
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <p
                        className={`border rounded-full p-1 text-center ${
                          admin.isActive
                            ? "text-green-500 border-green-500"
                            : "text-red-500 border-red-500"
                        }`}
                      >
                        {admin.isActive ? "Active" : "Inactive"}
                      </p>
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="font-bold w-full">
                          ...
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <ViewAdmin {...admin} />
                          <EditAdmin {...admin} />
                          <ResetPassword userId={Number(admin.userId)} email={admin.email} fullName={admin.fullName} />
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
