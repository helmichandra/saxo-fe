import React from "react";

const CertificateSection = () => {
  return (
    <div className="flex flex-col py-10 px-10 justify-center items-center gap-5">
      <div className="certificate-title font-bold text-xl">
        Terdaftar dan diawasi oleh
      </div>

      <div className="certificate-list flex flex-col md:flex-row gap-10 items-center">
        <img
          src="/image/cer-binance.png"
          alt="Certificate Binance"
          className="max-w-[130px] max-h-[35px] md:max-w-[238px] md:max-h-[45px] object-contain"
        />

        <img
          src="/image/cer-icdx.png"
          alt="Certificate ICDX"
          className="max-w-[130px] max-h-[35px] md:max-w-[238px] md:max-h-[45px] object-contain"
        />

        <img
          src="/image/cer-mendagri.png"
          alt="Certificate Mendagri"
          className="max-w-[130px] max-h-[35px] md:max-w-[238px] md:max-h-[45px] object-contain"
        />
      </div>
    </div>
  );
};

export default CertificateSection;