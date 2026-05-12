export const dynamic = "force-dynamic";

import React, {
  PropsWithChildren,
} from "react";

import { Button } from "@/components/ui/button";


const NonAuth = ({
  children,
}: PropsWithChildren) => {
  return (
    <div>
      <header className="mb-2.5 sticky top-0 z-50 px-10 bg-[#aff0ee]">
        <div className="header-wrap p-4 border-b border-gray-200">
          <nav className="max-w-container mx-auto flex items-center justify-between">

            {/* LEFT */}

            <div className="flex items-center space-x-2">
              <a
                href="/"
                className="cursor-pointer"
              >
                <img
                  src="/image/logo.png"
                  alt="Saxo Crypto"
                  className="w-[94px] h-auto object-contain"
                />
              </a>
            </div>

            {/* RIGHT */}

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
          </nav>
        </div>
      </header>

      <div className="max-w-[1299px] mx-auto overflow-auto">
        {children}
      </div>

      <footer>
        <div className="footer-wrap">
          <div className="max-w-container mx-auto px-10"></div>
        </div>
      </footer>
    </div>
  );
};

export default NonAuth;