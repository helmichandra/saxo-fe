"use client";
import { Input } from "@/components/ui/input";
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
import AddUser from "./addUser";
import EditUser from "./editUser";
import ViewUser from "./viewUser";
import { UsersResponse } from "@/models/Interface";
import { useEffect, useState } from "react";
import { sessionId } from "@/lib/getSession";
import AddCommision from "./addCommision";
import { logout } from "@/lib/auth";
import ResetPassword from "./resetPassword";

export default function UsersTable() {
  const [usersResponse, setUsersResponse] = useState<UsersResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);

  async function getUsers(): Promise<UsersResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/admin/users/getList`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          dev_chronome: "yes",
          authorization: `${sessionId}`,
        },
        body: JSON.stringify({ isDetail: true }),
      }
    );

    if (response.status === 401) {
      console.warn("Unauthorized. Logging out...");
      logout();
      return {data: [], page: 0, total: 0, totalPage: 0, limit: 0};
    }

    if (!response.ok) {
      throw new Error("Failed to fetch users.");
    }

    return await response.json();
  }

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getUsers();
        setUsersResponse(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = usersResponse
    ? usersResponse.data.filter(
        (user) =>
          user.userNumber.includes(searchTerm) ||
          user.phoneNumber.includes(searchTerm) ||
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageClick = (page: number) => setCurrentPage(page);
  const handleNextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const handlePreviousPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

  return (
    <div className="pb-10 pt-5">
      <div className="p-[11px] border border-gray-300 rounded-lg bg-white">
        <AddUser />
        <div className="flex justify-between items-center py-5">
          <h2 className="text-lg font-bold">Daftar Member</h2>
          <Input
            type="search"
            placeholder="Search"
            className="max-w-[300px] w-full"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full py-5">
            <thead>
              <tr>
                <th className="w-fit border-t border-b px-6 py-4 text-left">#</th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">Nama Lengkap</th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">Nomor Handphone</th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">Email</th>
                <th className="w-fit border-t border-b px-6 py-4 text-left">Status</th>
                <th className="w-fit border-t border-b px-6 py-4 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">No users found.</td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr key={user.userId}>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <p>{index + 1 + (currentPage - 1) * itemsPerPage}</p>
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b capitalize">
                      {user.fullName}
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      {user.phoneNumber}
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <p
                        className={`border rounded-full p-1 text-center ${
                          user.isActive
                            ? "text-green-500 border-green-500"
                            : "text-red-500 border-red-500"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </p>
                    </td>
                    <td className="px-6 py-4 align-middle border-t border-b">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="font-bold w-full">...</DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <ViewUser {...user} />
                          <EditUser {...user} />
                          <AddCommision userId={Number(user.userId)} fullName={user.fullName} />
                          <ResetPassword userId={Number(user.userId)} email={user.email} fullName={user.fullName} />
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
