import React, { PropsWithChildren } from "react";

const TableWrap = ({ children }: PropsWithChildren) => {
  const style = {
    tableHead: `border-t border-b px-4 py-2 bg-white text-right`,
  };
  return (
    <div className="overflow-auto py-10">
      <table className="table-auto w-full bg-white">
        <thead>
          <tr>
            <th className="border-t border-b px-4 py-2 sticky left-0 z-1 bg-white text-left">
              #
            </th>
            <th className="border-t border-b px-4 py-2 sticky left-[45px] z-1 bg-white text-left">
              Coin Name
            </th>
            <th className={style.tableHead}>Price</th>
            <th className={style.tableHead}>24h %</th>
            <th className={style.tableHead}>7d %</th>
            <th className={style.tableHead}>Market Cap</th>
            <th className={style.tableHead}>Volume(24h)</th>
            <th className={style.tableHead}>Circulating Supply</th>
            <th className={style.tableHead}></th>
          </tr>
        </thead>
        <tbody className="border-b border-gray-800 text-[.93rem]">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default TableWrap;
