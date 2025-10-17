import React from "react";
import CoinList from "./coinList";

const TrendCoins = () => {

  return (
    <div className="py-[24px] px-[22px] bg-[#0F172A] rounded-xl max-w-full md:max-w-[296px] w-full">
      <div className="text-white flex justify-between items-center pb-3">
        <div className="font-bold text-md">Sedang Tren (24 Jam)</div>
      </div>
      <div>
        <CoinList />
      </div>
    </div>
  );
};

export default TrendCoins;
