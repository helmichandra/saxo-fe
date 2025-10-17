import Image from "next/image";
import React from "react";
import CerBinance from "/public/image/cer-binance.png";
import CerIcdx from "/public/image/cer-icdx.png";
import CerMendagri from "/public/image/cer-mendagri.png";

const CertificateSection = () => {
  return (
    <div className="flex flex-col py-10 px-10 justify-center items-center gap-5">
      <div className="certificate-title font-bold text-xl">
        Terdaftar dan diawasi oleh
      </div>
      <div className="certificate-list flex flex-col md:flex-row gap-10">
        <Image
          src={CerBinance}
          alt="Certificate"
          className="max-w-[130px] max-h-[35px] md:max-w-[238px] md:max-h-[45px] object-contain"
        />
        <Image
          src={CerIcdx}
          alt="Certificate"
          className="max-w-[130px] max-h-[35px] md:max-w-[238px] md:max-h-[45px] object-contain"
        />
        <Image
          src={CerMendagri}
          alt="Certificate"
          className="max-w-[130px] max-h-[35px] md:max-w-[238px] md:max-h-[45px] object-contain"
        />
      </div>
    </div>
  );
};

export default CertificateSection;
