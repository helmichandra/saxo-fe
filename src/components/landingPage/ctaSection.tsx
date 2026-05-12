
import React from "react";

import { Button } from "../ui/button";

const CtaSection = () => {
  return (
    <div className="bg-primary p-10 flex-col md:flex-row gap-10 md:gap-0 flex justify-around items-start md:items-center my-10">

      <div className="cta-detail max-w-full md:max-w-[600px] flex flex-col gap-10">
        <h2 className="text-3xl font-bold text-white">
          Ambil langkah pertama menuju masa depan finansial Anda.
          Mulai investasi crypto dengan SAXO hari ini!
        </h2>

        <div className="flex items-center space-x-4">
          <a href="/auth/signin">
            <Button variant="default">
              Masuk
            </Button>
          </a>

          <a href="/auth/code-register">
            <Button variant="outline">
              Daftar Sekarang
            </Button>
          </a>
        </div>
      </div>

      <div className="cta-image max-w-[250px] md:max-w-[350px]">
        <img
          src="/image/hero-image.png"
          alt="Cta Image"
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  );
};

export default CtaSection;