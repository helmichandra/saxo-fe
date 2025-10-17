import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import HeroImage from "/public/image/hero-image.png";

const CtaSection = () => {
  return (
    <div className="bg-primary p-10 flex-col md:flex-row gap-10 md:gap-0 flex justify-around items-start md:items-center my-10">
      <div className="cta-detail max-w-full md:max-w-[600px] flex flex-col gap-10">
        <h2 className="text-3xl font-bold text-white">
          Ambil langkah pertama menuju masa depan finansial Anda. Mulai
          investasi crypto dengan SAXO hari ini!
        </h2>
        <div className="flex items-center space-x-4">
          <Link href="/auth/signin">
            <Button variant="default">Masuk</Button>
          </Link>
          <Link href="/auth/code-register">
            <Button variant="outline">Daftar Sekarang</Button>
          </Link>
        </div>
      </div>
      <div className="cta-image max-w-[250px] md:max-w-[350px]">
        <Image src={HeroImage} alt="Cta Image" />
      </div>
    </div>
  );
};

export default CtaSection;
