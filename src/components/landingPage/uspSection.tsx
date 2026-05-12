import React from "react";

const UspSection = () => {
  return (
    <div className="flex py-10 px-10 md:px-10 items-center justify-between flex-col lg:flex-row gap-10">

      <div className="usp-list flex flex-wrap max-w-[800px] justify-center md:mx-auto">

        {/* ITEM 1 */}

        <div
          className="usp-item border border-gray-400 rounded-xl"
          style={{
            flexBasis: "calc(400px - 22px)",
            padding: "11px",
            margin: "11px",
          }}
        >
          <div className="max-w-[50px] py-5">
            <img
              src="/image/icon-trusted.png"
              alt="Trusted Icon"
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="usp-detail">
            <div className="usp-title font-bold">
              Platform Terpercaya
            </div>

            <div className="usp-desc">
              SAXO memiliki reputasi global sebagai
              platform trading yang andal dan transparan,
              memberikan kepercayaan penuh bagi para investor.
            </div>
          </div>
        </div>

        {/* ITEM 2 */}

        <div
          className="usp-item border border-gray-400 rounded-xl"
          style={{
            flexBasis: "calc(400px - 22px)",
            padding: "11px",
            margin: "11px",
          }}
        >
          <div className="max-w-[50px] py-5">
            <img
              src="/image/icon-secure.png"
              alt="Secure Icon"
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="usp-detail">
            <div className="usp-title font-bold">
              Keamanan Tinggi
            </div>

            <div className="usp-desc">
              Menggunakan teknologi enkripsi terbaru
              untuk melindungi aset dan data pribadi Anda
              dari ancaman cyber.
            </div>
          </div>
        </div>

        {/* ITEM 3 */}

        <div
          className="usp-item border border-gray-400 rounded-xl"
          style={{
            flexBasis: "calc(400px - 22px)",
            padding: "11px",
            margin: "11px",
          }}
        >
          <div className="max-w-[50px] py-5">
            <img
              src="/image/icon-ease.png"
              alt="Ease Icon"
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="usp-detail">
            <div className="usp-title font-bold">
              Kemudahan Pengguna
            </div>

            <div className="usp-desc">
              Antarmuka yang intuitif dan ramah pengguna,
              cocok untuk pemula hingga profesional.
            </div>
          </div>
        </div>

        {/* ITEM 4 */}

        <div
          className="usp-item border border-gray-400 rounded-xl"
          style={{
            flexBasis: "calc(400px - 22px)",
            padding: "11px",
            margin: "11px",
          }}
        >
          <div className="max-w-[50px] py-5">
            <img
              src="/image/icon-diversity.png"
              alt="Diversity Icon"
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="usp-detail">
            <div className="usp-title font-bold">
              Beragam Pilihan Coin
            </div>

            <div className="usp-desc">
              Menyediakan berbagai cryptocurrency
              terkemuka untuk diversifikasi investasi Anda.
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT IMAGE */}

      <div className="usp-image max-w-[450px] hidden lg:block">
        <img
          src="/image/usp-image.png"
          alt="USP Image"
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  );
};

export default UspSection;