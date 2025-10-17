export const dynamic = "force-dynamic";
import React, { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import Logo from "/public/image/logo.png";

const NonAuth = ({ children }: PropsWithChildren) => {
  return (
    <div>
      <header className="mb-2.5 sticky top-0 z-50 px-10 bg-[#aff0ee]">
        <div className=" header-wrap p-4 border-b border-gray-200">
          <nav className="max-w-container mx-auto flex items-center justify-between ">
            {/* Left Side - Logo */}
            <div className="flex items-center space-x-2">
              <Link href="/" className="cursor-pointer">
                <Image
                  src={Logo}
                  width={94}
                  height={40}
                  alt="Saxo Crypto"
                  className="self-center"
                />
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="outline">Masuk</Button>
              </Link>
              <Link href="/auth/code-register">
                <Button variant="default">Daftar Sekarang</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <div className="max-w-[1299px] mx-auto overflow-auto">{children}</div>
      <footer>
        <div className="footer-wrap">
          <div className="max-w-container mx-auto px-10"></div>
        </div>
      </footer>
    </div>
  );
};

export default NonAuth;
