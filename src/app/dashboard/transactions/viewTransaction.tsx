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
import { FiatsTransaction, CryptoWallet } from "@/models/Interface";
import { DialogDescription } from "@radix-ui/react-dialog";
import { sessionId } from "@/lib/getSession";
import { logout } from "@/lib/auth";

type TransactionProps = {
  transactionFiat?: FiatsTransaction;
  transactionWallet?: CryptoWallet;
};

const ViewTransaction: React.FC<TransactionProps> = ({
  transactionFiat,
  transactionWallet,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [transactionDetail, setTransactionDetail] = useState<FiatsTransaction | CryptoWallet | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactionDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      if (transactionFiat?.transactionId) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fiat/request/getDetail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            dev_chronome: "yes",
            authorization: `${sessionId}`,
          },
          body: JSON.stringify({
            requestId: transactionFiat.transactionId,
            type: transactionFiat.transactionType,
          }),
        });

      if (response.status === 401) {
        console.warn("Unauthorized. Redirecting...");
        logout();
        return;
      }

        const data = await response.json();
        console.log(data);
        setTransactionDetail(data.data);
      } else if (transactionWallet?.tradingId) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trade/coinwallet/getBalanceDetail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            dev_chronome: "yes",
            authorization: `${sessionId}`,
          },
          body: JSON.stringify({
            tradingId: transactionWallet.tradingId,
          }),
        });

        const data = await response.json();
        setTransactionDetail(data.data[0]);
      }
    } catch (err) {
      setError(err + "Failed to fetch transaction details");
    } finally {
      setLoading(false);
    }
  };


  const handleViewClick = () => {
    if (transactionFiat || transactionWallet) {
      fetchTransactionDetail();
      setIsDialogOpen(true);
    }
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild onClick={handleViewClick}>
          <span className="relative hover:bg-gray-100 flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">
            Lihat
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>
          <DialogDescription>

          </DialogDescription>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && transactionDetail && (
              <div className="rounded-lg border py-3 px-5">
           {transactionFiat && (
              <>
                {transactionDetail?.depositData?.transactionType === "deposit" || transactionDetail?.depositData?.transactionType === "Deposit" && (
                  <>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Nomor Transaksi:</span>
                      <p className="capitalize">
                        {transactionDetail?.depositData?.depositId}
                      </p>
                    </div>
                    <div className="flex flex-row justify-between gap-2 py-3">
                      <span className="font-medium">Tipe Transaksi:</span>
                      <p className="capitalize">
                        {transactionDetail?.depositData?.transactionType}
                      </p>
                    </div>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Status:</span>
                      <p className={`capitalize ${
                        transactionDetail?.depositData?.status === 1 
                          ? 'text-green-500' 
                          : transactionDetail?.depositData?.status === -1 
                          ? 'text-red-500' 
                          : 'text-orange-500'
                      }`}>
                        {transactionDetail?.depositData?.status === 1 
                          ? 'Approve' 
                          : transactionDetail?.depositData?.status === -1 
                          ? 'Reject' 
                          : 'Pending'}
                      </p>
                    </div>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Metode Pembayaran:</span>
                      <p className="uppercase">
                        {transactionDetail?.depositData?.bankPayment}
                      </p>
                    </div>
                    <div className="border border-gray my-3"></div>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Tanggal Penyetujuan:</span>
                      <p className="uppercase">
                        {transactionDetail?.depositData?.adminApproved}
                      </p>
                    </div>
                    {transactionDetail?.depositData?.adminNotes != "" && (  
                    <div className="flex flex-col bg-gray-100 rounded-lg justify-between gap-1 py-3 px-3">
                      <span className="font-bold">Catatan Admin:</span>
                      <p className="">{transactionDetail?.depositData?.adminNotes}</p>
                    </div>
                    )}
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Tanggal Pengajuan:</span>
                      <p className="capitalize">
                        {transactionDetail?.depositData?.requestDate}
                      </p>
                    </div>
                    <div className="flex flex-col justify-between gap-1 py-3">
                      <span className="font-medium">Bukti Transfer:</span>
                      <p className="">
                        <a
                          href={`${process.env.NEXT_PUBLIC_BASE_URL}/storage/deposits/${transactionDetail?.depositData?.transferReceipt}`}
                          download
                        >
                          <Button variant="default">Download Bukti Transfer</Button>
                        </a>
                      </p>
                    </div>
                  </>
                )}

                {transactionDetail?.withdrawData?.transactionType === "withdraw" || transactionDetail?.withdrawData?.transactionType === "Withdraw" && (
                  <>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Nomor Transaksi:</span>
                      <p className="capitalize">
                        {transactionDetail?.withdrawData?.withdrawId}
                      </p>
                    </div>
                    <div className="flex flex-row justify-between gap-2 py-3">
                      <span className="font-medium">Tipe Transaksi:</span>
                      <p className="capitalize">
                        {transactionDetail?.withdrawData?.transactionType}
                      </p>
                    </div>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Status:</span>
                      <p className={`capitalize ${
                        transactionDetail?.withdrawData?.status === 1 
                          ? 'text-green-500' 
                          : transactionDetail?.withdrawData?.status === -1 
                          ? 'text-red-500' 
                          : 'text-orange-500'
                      }`}>
                        {transactionDetail?.withdrawData?.status === 1 
                          ? 'Approve' 
                          : transactionDetail?.withdrawData?.status === -1 
                          ? 'Reject' 
                          : 'Pending'}
                      </p>
                    </div>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Ke Rekening:</span>
                      <p className="uppercase">
                        {transactionDetail?.withdrawData?.bankCustomer}
                        <br />
                        A/N {transactionDetail?.withdrawData?.bankCustomerHolderName || "-"}
                      </p>
                    </div>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Nama Bank:</span>
                      <p className="uppercase">
                        {transactionDetail?.withdrawData?.bankCustomerName}
                      </p>
                    </div>
                    <div className="border border-gray my-3"></div>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Tanggal Penyetujuan:</span>
                      <p className="uppercase">
                        {transactionDetail?.withdrawData?.approvedDate}
                      </p>
                    </div>
                    {transactionDetail?.withdrawData?.adminNotes != "" && (  
                    <div className="flex flex-col bg-gray-100 rounded-lg justify-between gap-1 py-3 px-3">
                      <span className="font-bold">Catatan Admin:</span>
                      <p className="">{transactionDetail?.withdrawData?.adminNotes}</p>
                    </div>
                    )}
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Tanggal Pengajuan:</span>
                      <p className="capitalize">
                        {transactionDetail?.withdrawData?.requestDate}
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
                {transactionWallet && (
                  <>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Nomor Transaksi:</span>
                      <span className="capitalize">{transactionDetail?.tradingId}</span>
                    </div>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Crypto ID:</span>
                      <span className="capitalize">{transactionDetail?.cryptoWalletId}</span>
                    </div>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Nama Koin:</span>
                      <span className="capitalize">{transactionWallet?.cryptocurrencyType.coinName}</span>
                    </div>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Jumlah Koin:</span>
                      <span className="capitalize">{transactionDetail?.coinAmount}</span>
                    </div>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Jumlah Rupiah:</span>
                      <span className="capitalize">Rp {Number(transactionWallet?.fiatAmountConverted.toFixed(2)).toLocaleString()}</span>
                    </div>
                    <div className="border border-gray my-3"></div>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Tipe Transaksi:</span>
                      <span className="capitalize">{transactionWallet?.type}</span>
                    </div>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Alur Transaksi:</span>
                      <span className="capitalize">{transactionDetail?.walletCashflow}</span>
                    </div>
                    <div className="flex flex-row justify-between gap-1 py-3">
                      <span className="font-medium">Tanggal Transaksi:</span>
                      <span className="capitalize">{transactionDetail?.createdDate}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Tutup
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewTransaction;