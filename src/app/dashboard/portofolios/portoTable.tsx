"use client";
import { sessionId } from "@/lib/getSession";
import { CryptoWallet } from "@/models/Interface";
import React, { useEffect, useState } from "react";
import SellCoin from "../markets/[slug]/sellCoin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/toaster";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { logout } from "@/lib/auth";

const PortoTable = () => {
  const [portos, setPortos] = useState<CryptoWallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [usdToIdrRate, setUsdToIdrRate] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPortos = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/trade/coinwallet/getBalances`,
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
          throw new Error("Failed to fetch portfolio");
        }
        setPortos(data.data);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchConversionRate = async () => {
      try {
        const response = await fetch(
          "https://cdn.jsdelivr.net/gh/prebid/currency-file@1/latest.json"
        );
        const data = await response.json();
        const rate = data.conversions?.USD?.IDR || null;
        setUsdToIdrRate(rate);
      } catch (error) {
        console.error("Error fetching conversion rate:", error);
      }
    };

    fetchPortos();
    fetchConversionRate();
  }, []);


  const filteredData = portos.filter((porto) =>
    porto.cryptocurrencyType.coinName
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageClick = (page: number) => setCurrentPage(page);
  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div>
      <Toaster />
      <div className="p-[11px] border border-gray-300 rounded-lg bg-white">
        <div className="flex justify-between items-center py-5">
          <h2 className="text-lg font-bold">List Portofolio</h2>
          <Input
            type="search"
            placeholder="Search by Coin Name"
            className="max-w-[300px]"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full py-5">
            <thead>
              <tr>
                <th className="w-fit border-t border-b p-4 text-left">#</th>
                <th className="w-fit border-t border-b p-4 text-left">Nama Koin</th>
                <th className="w-fit border-t border-b p-4 text-left">Jumlah Koin</th>
                <th className="w-fit border-t border-b p-4 text-left">Harga (Realtime)</th>
                <th className="w-fit border-t border-b p-4 text-left">Tanggal Transaksi</th>
                <th className="w-fit border-t border-b p-4 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    No balances found.
                  </td>
                </tr>
              ) : (
                currentItems.map((porto, index) => (
                  <tr key={porto.cryptoWalletId}>
                    <td className="p-4 align-middle border-t border-b">
                      {index + 1 + (currentPage - 1) * itemsPerPage}
                    </td>
                    <td className="p-4 align-middle border-t border-b">
                      {porto.cryptocurrencyType.coinName} (
                      {porto.cryptocurrencyType.coinCode})
                    </td>
                    <td className="p-4 align-middle border-t border-b">
                      {porto.balance}
                    </td>
                    <td className="p-4 align-middle border-t border-b">
                      {usdToIdrRate
                        ? `Rp ${(porto.balance * porto.cryptocurrencyType.currentIdrRate).toLocaleString(
                            "id-ID"
                          )}`
                        : "Fetching..."}
                    </td>
                    <td className="p-4 align-middle border-t border-b">
                      {new Date(porto.createdDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="font-bold w-full">
                            ...
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <SellCoin {...porto} />
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
};

export default PortoTable;
