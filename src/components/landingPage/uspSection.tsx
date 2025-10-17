import Image from "next/image";
import React from "react";
import IconTrusted from "/public/image/icon-trusted.png";
import IconSecure from "/public/image/icon-secure.png";
import IconEase from "/public/image/icon-ease.png";
import IconDiversity from "/public/image/icon-diversity.png";
import UspImage from "/public/image/usp-image.png";

const UspSection = () => {
  return (
    <div className="flex py-10 px-10 md:px-10 items-center justify-between">
      <div className="usp-list flex flex-wrap max-w-[800px] justify-center md:mx-auto">
        <div
          className="usp-item border border-gray-400 rounded-xl "
          style={{
            flexBasis: "calc(400px - 22px)",
            padding: "11px",
            margin: "11px",
          }}
        >
          <div className="max-w-[50px] py-5">
            <Image src={IconTrusted} alt="" />
          </div>
          <div className="usp-detail">
            <div className="usp-title font-bold">Platform Terpercaya</div>
            <div className="usp-desc">
              SAXO memiliki reputasi global sebagai platform trading yang andal
              dan transparan, memberikan kepercayaan penuh bagi para investor.
            </div>
          </div>
        </div>
        <div
          className="usp-item border border-gray-400 rounded-xl "
          style={{
            flexBasis: "calc(400px - 22px)",
            padding: "11px",
            margin: "11px",
          }}
        >
          <div className="max-w-[50px] py-5">
            <Image src={IconSecure} alt="" />
          </div>
          <div className="usp-detail">
            <div className="usp-title font-bold">Keamanan Tinggi</div>
            <div className="usp-desc">
              Menggunakan teknologi enkripsi terbaru untuk melindungi aset dan
              data pribadi Anda dari ancaman cyber.
            </div>
          </div>
        </div>
        <div
          className="usp-item border border-gray-400 rounded-xl "
          style={{
            flexBasis: "calc(400px - 22px)",
            padding: "11px",
            margin: "11px",
          }}
        >
          <div className="max-w-[50px] py-5">
            <Image src={IconEase} alt="" />
          </div>
          <div className="usp-detail">
            <div className="usp-title font-bold">Kemudahan Pengguna</div>
            <div className="usp-desc">
              Antarmuka yang intuitif dan ramah pengguna, cocok untuk pemula
              hingga profesional.
            </div>
          </div>
        </div>
        <div
          className="usp-item border border-gray-400 rounded-xl "
          style={{
            flexBasis: "calc(400px - 22px)",
            padding: "11px",
            margin: "11px",
          }}
        >
          <div className="max-w-[50px] py-5">
            <Image src={IconDiversity} alt="" />
          </div>
          <div className="usp-detail">
            <div className="usp-title font-bold">Beragam Pilihan Coin</div>
            <div className="usp-desc">
              Menyediakan berbagai cryptocurrency terkemuka untuk diversifikasi
              investasi Anda.
            </div>
          </div>
        </div>
      </div>
      <div className="usp-image max-w-[450px] hidden lg:block">
        <Image src={UspImage} alt="" />
      </div>
    </div>
  );
};

export default UspSection;
