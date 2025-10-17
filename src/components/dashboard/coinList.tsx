"use client";
import { CryptocurrencyData } from "@/models/Interface";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const CoinList = () => {
  const [cryptos, setCryptos] = useState<CryptocurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 3;

  const getTopCoins = async () => {
    try {
      const res = await fetch("/api/getTrends");
      if (!res.ok) {
        throw new Error(`Failed to fetch, status: ${res.status}`);
      }
      const data = await res.json();
      setCryptos(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching top coins:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getTopCoins();

    const interval = setInterval(() => {
      getTopCoins();
    }, 100000);

    return () => clearInterval(interval);
  }, []);

  const paginatedCryptos = cryptos.slice(0, itemsPerPage);

  return (
    <div>
      <table className="w-full">
        <tbody>
          {paginatedCryptos.map((crypto) => (
            <tr key={crypto.id}>
              <td className="py-2.5 flex justify-between items-center">
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
                  <span className="font-bold text-md ms-2 text-white">
                    <p className="text-right">{crypto.name}</p>
                  </span>
                  <span className="text-sm ms-1 font-normal text-white">
                    <p className="text-right">{crypto.symbol}</p>
                  </span>
                </div>
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
                        xmlns="https://www.w3.org/2000/svg"
                        fill="#EA3943"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21l-12-18h24z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="https://www.w3.org/2000/svg"
                        fill="#17C784"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 22h-24l12-20z" />
                      </svg>
                    )}
                    {crypto.priceInTargetCurrency.percent_change_24h} %
                  </p>
                </div>
              </td>
            </tr>
          ))}
          {loading && (
            <tr>
              <td>
                <div className="text-sm text-gray-400">Loading...</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CoinList;
