import React, { useState, useEffect, useCallback } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { sessionId } from "@/lib/getSession";
import { FiatsTransaction } from "@/models/Interface";
import { logout } from "@/lib/auth";

const ViewUserFiat = ({ wallet }: { wallet: FiatsTransaction }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [transactionDetails, setTransactionDetails] = useState<FiatsTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchTransactionDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/fiat/admin/fiat-balance-listing-users/detail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            dev_chronome: "yes",
            authorization: `${sessionId}`,
          },
          body: JSON.stringify({ fiatWalletId: wallet.fiatWalletId }),
        }
      );

      if (response.status === 401) {
        console.warn("Unauthorized. Logging out...");
        logout();
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      setTransactionDetails(data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: '' + error || "Failed to fetch transaction details.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [wallet.fiatWalletId, toast]);

  useEffect(() => {
    if (isDialogOpen) {
      fetchTransactionDetails();
    }
  }, [isDialogOpen, fetchTransactionDetails]);

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
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {loading ? (
            <p>Loading...</p>
          ) : transactionDetails.length === 0 ? (
            <p>No transaction details found.</p>
          ) : (
            <div className="rounded-lg border py-3 px-5">
              {transactionDetails.map((detail, index) => (
                <div key={index} className="mb-4">
                  <div className="flex flex-row justify-between gap-2 py-3">
                    <span className="font-medium">Nomor Transaksi:</span>
                    <p>{detail.transactionNumber || "-"}</p>
                  </div>
                  <div className="flex flex-row justify-between gap-2 py-3">
                    <span className="font-medium">Jumlah Transaksi Terakhir:</span>
                    <p>Rp {detail.nominalAmount.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-row justify-between gap-2 py-3">
                    <span className="font-medium">Saldo terkini:</span>
                    <p>Rp {wallet.balance.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-row justify-between gap-2 py-3">
                    <span className="font-medium">Tipe Transaksi:</span>
                    <p>{detail.nominalFlow}</p>
                  </div>
                  {detail.remark != "" && detail.remark != null && (
                    <div className="flex flex-col bg-gray-100 rounded-lg justify-between gap-1 py-3 px-3">
                        <span className="font-bold">Catatan Admin:</span>
                        <p className="">{detail.remark}</p>
                    </div>
                  )}
                  <div className="flex flex-row justify-between gap-2 py-3">
                    <span className="font-medium">Dibuat oleh:</span>
                    <p>{detail.createdBy}</p>
                  </div>
                  <div className="flex flex-row justify-between gap-2 py-3">
                    <span className="font-medium">Tanggal Dibuat:</span>
                    <p>{new Date(detail.createdDate).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-row justify-between gap-2 py-3">
                    <span className="font-medium">Diubah Oleh:</span>
                    <p>{detail.modifiedBy}</p>
                  </div>
                  <div className="flex flex-row justify-between gap-2 py-3">
                    <span className="font-medium">Tanggal Diubah:</span>
                    <p>{new Date(detail.modifiedDate).toLocaleString()}</p>
                  </div>
                  {index !== transactionDetails.length - 1 && <hr className="my-3" />}
                </div>
              ))}
            </div>
          )}
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

export default ViewUserFiat;
