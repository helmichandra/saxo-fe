import React from "react";
import ShowBalance from "./showBalance";
import TrendCoins from "./trendCoin";
import UserPorto from "./userPorto";

const HeadContent = () => {
  return (
    <div className="flex flex-col md:flex-row gap-[11px] w-full py-2">
      <ShowBalance />
      <TrendCoins />
      <UserPorto />
    </div>
  );
};

export default HeadContent;
