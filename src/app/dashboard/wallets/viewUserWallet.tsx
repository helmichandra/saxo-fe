import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CryptoWallet } from "@/models/Interface";

const ViewUserWallet = ({ wallet }: { wallet: CryptoWallet }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <span className="relative hover:bg-gray-100 flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground">
            View
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Koin</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border py-3 px-5">
            <div className="flex flex-row justify-between gap-2 py-3">
              <span className="font-medium">Koin Wallet ID:</span>
              <p>{wallet.cryptoWalletId}</p>
            </div>
            <div className="flex flex-row justify-between gap-2 py-3">
              <span className="font-medium">Nama Lengkap:</span>
              <p className="capitalize">{wallet.user.fullName}</p>
            </div>
            <div className="flex flex-row justify-between gap-2 py-3">
              <span className="font-medium">Nama Koin:</span>
              <p>{wallet.t.coinName}</p>
            </div>
            <div className="flex flex-row justify-between gap-2 py-3">
              <span className="font-medium">Kode Koin:</span>
              <p>{wallet.t.coinCode}</p>
            </div>
            <div className="flex flex-row justify-between gap-2 py-3">
              <span className="font-medium">Jumlah:</span>
              <p>{wallet.balance.toLocaleString()}</p>
            </div>
            <div className="flex flex-row justify-between gap-2 py-3">
              <span className="font-medium">Tanggal Diubah:</span>
              <p>
                {new Date(wallet.modifiedDate).toLocaleString("en-US", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewUserWallet;
