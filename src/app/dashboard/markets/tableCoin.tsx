"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CryptocurrencyData } from "@/models/Interface";

const TableCoin = () => {
  const [cryptos, setCryptos] = useState<CryptocurrencyData[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getTopCoins = async () => {
    try {
      const res = await fetch("/api/getCoins");
      if (!res.ok) {
        throw new Error(`Failed to fetch, status: ${res.status}`);
      }
      const data = await res.json();
      setCryptos(data.data);
    } catch (error) {
      console.error("Error fetching top coins:", error);
    }
  };

  useEffect(() => {
    getTopCoins();

    const interval = setInterval(() => {
      getTopCoins();
    }, 300000); // Refresh setiap 5 menit

    return () => clearInterval(interval);

  }, []);

  const totalPages = Math.ceil(cryptos.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginatedCryptos = cryptos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
    <div className="overflow-x-auto bg-white rounded-xl">
      <table>
        <thead className="border-b border-t font-medium w-full">
          <tr>
            <th className="text-start px-6 py-4">Ranking</th>
            <th className="text-start sticky left-0 bg-white px-3 py-0 md:px-7 md:py-4 me-2">Nama Koin</th>
            <th className="text-end px-6 py-4">Harga (IDR)</th>
            <th className="text-end px-6 py-4">24 jam</th>
            <th className="text-end px-6 py-4">7 hari</th>
            <th className="text-end px-6 py-4">Kapitalisasi Pasar</th>
            <th className="text-end px-6 py-4">Persediaan Beredar</th>
            <th className="text-end px-6 py-4"></th>
          </tr>
        </thead>
        <tbody>
          {paginatedCryptos.map((crypto, index) => (
            <tr key={crypto.id} className="border-b cursor-pointer" onClick={() => window.location.href = `/dashboard/markets/${crypto.slug}`}>
              <td className="whitespace-nowrap px-6 py-4">
                <p className="font-bold">
                  # {index + 1 + (currentPage - 1) * itemsPerPage}
                </p>
              </td>

              <td className="sticky md:whitespace-nowrap whitespace-normal left-0 w-fit px-3 py-0 md:px-7 md:py-4 me-2 bg-white">
                <div className="flex items-center">
                  {crypto.logoUrl ? (
                    <Image
                      src={crypto.logoUrl}
                      alt={crypto.name}
                      className="w-6 h-6 object-contain"
                      width={24}
                      height={24}
                    />
                  ) : (
                    <p>N/A</p>
                  )}
                  <span className="font-bold text-md ms-2">
                    <p className="text-left">{crypto.name}</p>
                  </span>
                  <span className="text-sm ms-1 font-normal">
                    <p className="text-left">{crypto.symbol}</p>
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 bg-white">
                <p className="text-right font-bold">
                  Rp
                  {Number(
                    crypto.priceInTargetCurrency.price.toFixed(2)
                  ).toLocaleString()}
                </p>
              </td>
              <td className="whitespace-nowrap px-6 py-4 min-w-[100px] bg-white">
                <div className="text-right font-bold">
                  <p
                    className={
                      crypto.priceInTargetCurrency.percent_change_24h < 0
                        ? "text-red-500 flex items-center gap-2"
                        : "text-green-500 flex items-center gap-2"
                    }
                  >
                    {crypto.priceInTargetCurrency.percent_change_24h < 0 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#EA3943"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21l-12-18h24z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#17C784"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 22h-24l12-20z" />
                      </svg>
                    )}
                    {crypto.priceInTargetCurrency.percent_change_24h}%
                  </p>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 min-w-[100px] bg-white">
                <div className="text-right font-bold">
                  <p
                    className={
                      crypto.priceInTargetCurrency.percent_change_7d < 0
                        ? "text-red-500 flex items-center gap-2"
                        : "text-green-500 flex items-center gap-2"
                    }
                  >
                    {crypto.priceInTargetCurrency.percent_change_7d < 0 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#EA3943"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21l-12-18h24z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#17C784"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 22h-24l12-20z" />
                      </svg>
                    )}
                    {crypto.priceInTargetCurrency.percent_change_7d}%
                  </p>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 bg-white">
                <p className="text-right font-bold">
                  Rp
                  {Number(
                    crypto.priceInTargetCurrency.market_cap.toFixed(2)
                  ).toLocaleString()}
                </p>
              </td>
              <td className="whitespace-nowrap px-6 py-4 bg-white">
                <p className="text-right font-bold">
                  {Number(
                    crypto.circulating_supply.toFixed(2)
                  ).toLocaleString()}
                  <span className="ms-1">{crypto.symbol}</span>
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
      <div className="py-5">
        <Pagination className="justify-center flex-wrap">
          <PaginationContent className="flex flex-wrap justify-center">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => handlePageChange(currentPage - 1)}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  isActive={index + 1 === currentPage}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
};

export default TableCoin;
