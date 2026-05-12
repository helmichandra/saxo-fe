import React from "react";


import { Button } from "../ui/button";

const HeroSection = () => {
  return (
    <div className="flex justify-between items-center py-10 px-10 flex-col gap-10 lg:flex-row md:gap-10 md:mx-auto">

      <div className="hero-detail flex flex-col gap-7 max-w-[650px]">
        <h1 className="text-4xl font-bold">
          Mulai Perjalanan Investasi Crypto Anda Bersama SAXO!
        </h1>

        <p>
          Mulai investasi cryptocurrency Anda dengan platform
          yang menawarkan kemudahan penggunaan dan keamanan tinggi.
          SAXO memastikan setiap transaksi Anda terlindungi
          dan efisien.
        </p>

        <div className="flex items-center space-x-4">
          <a href="/auth/signin">
            <Button variant="outline">
              Masuk
            </Button>
          </a>

          <a href="/auth/code-register">
            <Button variant="default">
              Daftar Sekarang
            </Button>
          </a>
        </div>
      </div>

      <div className="hero-image max-w-[320px] md:max-w-[420px]">
        <img
          src="/image/hero-image.png"
          alt="Hero Image"
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  );
};

export default HeroSection;