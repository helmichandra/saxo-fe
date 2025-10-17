"use client";
import { CryptocurrencyData } from "@/models/Interface";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const CoinSmallList = () => {
  const [cryptos, setCryptos] = useState<CryptocurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getTopCoins = async () => {
    try {
      const res = await fetch("/api/getCoins");
      if (!res.ok) {
        throw new Error(`Failed to fetch, status: ${res.status}`);
      }
      const data = await res.json();
      setCryptos(data.data.slice(0, 7));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching top coins:", error);
      setError("Error fetching coins, try refreshing.");
      setLoading(false);
    }
  };

  useEffect(() => {
    getTopCoins();
  }, []);

  return (
    <div className="flex flex-col rounded-xl overflow-hidden shadow-xl max-w-[430px] w-full">
      <div className="title-coinlist flex justify-between items-center p-4 bg-gray-200">
        <span className="font-bold">Market</span>
        <span className="font-bold">Dalam 24h</span>
      </div>
      <div className="small-coinlist flex flex-col">
        <div className="px-4">
          {loading && <p>Loading...</p>}
          {error && <p>{error}</p>}
        </div>
        {cryptos.map((crypto) => (
          <div
            key={crypto.id}
            className="small-coinitem border-t border-b flex justify-between items-center p-4"
          >
            <div className="flex items-center gap-2">
              {crypto.logoUrl ? (
                <Image
                  src={crypto.logoUrl}
                  alt={crypto.symbol}
                  className="w-6 h-6 object-contain"
                  width={18}
                  height={18}
                />
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
              <span className="font-bold">{crypto.name}</span>
            </div>
            <span
              className={
                crypto.priceInTargetCurrency.percent_change_24h < 0
                  ? "text-red-500 flex items-center gap-2 font-bold"
                  : "text-green-500 flex items-center gap-2 font-bold"
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
              {crypto.priceInTargetCurrency.percent_change_24h}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoinSmallList;
