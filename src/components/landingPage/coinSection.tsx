import React from "react";
import CoinSmallList from "./coinSmallList";
import Link from "next/link";
import { Button } from "../ui/button";

const CoinSection = () => {
  return (
    <div className="py-20 flex flex-col-reverse gap-10 px-10 md:px-10 md:gap-10 md:flex-row  justify-between items-center">
      <CoinSmallList />
      <div className="max-w-[700px] flex flex-col gap-5">
        <h2 className="text-3xl font-bold">
          Temukan koin terpopuler yang ada di market hanya di Saxo
        </h2>
        <p>
          Jelajahi dunia market crypto dengan SAXO dan temukan peluang investasi
          baru.
        </p>
        <span className="font-bold italic text-lg">
          Daftar untuk mulai trading sekarang!
        </span>
        <div className="flex items-center space-x-4">
          <Link href="/auth/signin">
            <Button variant="outline">Masuk</Button>
          </Link>
          <Link href="/auth/code-register">
            <Button variant="default">Daftar Sekarang</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CoinSection;
