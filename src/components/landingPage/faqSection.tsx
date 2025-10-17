import React from "react";

const FaqSection = () => {
  return (
    <div className="py-10 flex justify-between items-start flex-col md:flex-row px-10 md:px-10 md:py-0">
      <div className="py-10 max-w-[350px]">
        <h2 className="text-2xl font-bold text-black">
          Pertanyaan yang Sering Diajukan
        </h2>
      </div>
      <div className="space-y-4 max-w-2xl">
        <div className="border-b-2 border-gray-200 pb-4">
          <h2 className="text-xl font-semibold">Apa itu Crypto?</h2>
          <p className="text-gray-600">
            Crypto adalah mata uang digital yang menggunakan kriptografi untuk
            transaksi aman tanpa perantara
          </p>
        </div>
        <div className="border-b-2 border-gray-200 pb-4">
          <h2 className="text-xl font-semibold">Mengapa memilih SAXO?</h2>
          <p className="text-gray-600">
            SAXO menawarkan platform yang aman, mudah digunakan dan terpercaya
            dengan berbagai pilihan aset crypto
          </p>
        </div>
        <div className="border-b-2 border-gray-200 pb-4">
          <h2 className="text-xl font-semibold">
            Bagaimana cara memulai trading di SAXO?
          </h2>
          <p className="text-gray-600">
            Mudah! Hanya dengan 1 kali membuat akun pada SAXO Trading, lalu top up saldo, kita dapat trading berbagai macam cryptocurrency!
          </p>
        </div>
        <div className="border-b-2 border-gray-200 pb-4">
          <h2 className="text-xl font-semibold">
            Apakah dana saya aman di SAXO?
          </h2>
          <p className="text-gray-600">
            SAXO terlindungi oleh jaringan keamanan setiap kali kita melakukan transaksi atau penampilan Cryptocurrency pada anda!
          </p>
        </div>
      </div>
    </div>
  );
};

export default FaqSection;
