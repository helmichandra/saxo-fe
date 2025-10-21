import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FiatsTransaction, CryptoWallet } from "@/models/Interface";
import { sessionId } from "@/lib/getSession";
import { logout } from "@/lib/auth";
import { Eye, Download } from "lucide-react";

type TransactionProps = {
  transactionFiat?: FiatsTransaction;
  transactionWallet?: CryptoWallet;
};

interface DepositData {
  depositId: string;
  transactionType: string;
  status: number;
  bankPayment: string;
  adminApproved: string;
  adminNotes: string;
  requestDate: string;
  transferReceipt: string;
}

interface WithdrawData {
  withdrawId: string;
  transactionType: string;
  status: number;
  bankCustomer: string;
  bankCustomerHolderName: string;
  bankCustomerName: string;
  approvedDate: string;
  adminNotes: string;
  requestDate: string;
}

interface CryptoDetailData {
  tradingId: string;
  cryptoWalletId: string;
  coinAmount: string;
  walletCashflow: string;
  createdDate: string;
}

interface TransactionDetailType {
  depositData?: DepositData;
  withdrawData?: WithdrawData;
  tradingId?: string;
  cryptoWalletId?: string;
  coinAmount?: string;
  walletCashflow?: string;
  createdDate?: string;
}

const ViewTransaction: React.FC<TransactionProps> = ({
  transactionFiat,
  transactionWallet,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [transactionDetail, setTransactionDetail] = useState<TransactionDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactionDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      if (transactionFiat?.transactionId) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/fiat/request/getDetail`,
          {
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
          }
        );

        if (response.status === 401) {
          console.warn("Unauthorized. Redirecting...");
          logout();
          return;
        }

        const data = await response.json();
        setTransactionDetail(data.data);
      } else if (transactionWallet?.tradingId) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/trade/coinwallet/getBalanceDetail`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              dev_chronome: "yes",
              authorization: `${sessionId}`,
            },
            body: JSON.stringify({
              tradingId: transactionWallet.tradingId,
            }),
          }
        );

        const data = await response.json();
        setTransactionDetail(data.data[0]);
      }
    } catch (err) {
      setError("Gagal memuat detail transaksi");
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

  const getStatusBadge = (status: number) => {
    if (status === 0) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-500">
          Pending
        </Badge>
      );
    } else if (status === 1) {
      return (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Approved
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-red-500 text-red-500">
          Rejected
        </Badge>
      );
    }
  };

  const DetailRow = ({
    label,
    value,
    mono = false,
  }: {
    label: string;
    value: string | React.ReactNode;
    mono?: boolean;
  }) => (
    <div className="flex justify-between items-start py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium text-right ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild onClick={handleViewClick}>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Eye className="w-4 h-4 mr-2" />
          Lihat Detail
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
          <DialogDescription>
            Informasi lengkap transaksi Anda
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {error && (
          <Card className="p-4 border-destructive">
            <p className="text-sm text-destructive text-center">{error}</p>
          </Card>
        )}

        {!loading && !error && transactionDetail && (
          <div className="space-y-4">
            {/* Fiat Deposit Transaction */}
            {transactionFiat &&
              transactionDetail?.depositData &&
              (transactionDetail.depositData.transactionType === "deposit" ||
                transactionDetail.depositData.transactionType === "Deposit") && (
                <Card className="p-4">
                  <div className="space-y-3">
                    <DetailRow
                      label="Nomor Transaksi"
                      value={transactionDetail.depositData.depositId}
                      mono
                    />
                    <DetailRow
                      label="Tipe Transaksi"
                      value={
                        <span className="capitalize">
                          {transactionDetail.depositData.transactionType}
                        </span>
                      }
                    />
                    <DetailRow
                      label="Status"
                      value={getStatusBadge(transactionDetail.depositData.status)}
                    />
                    <DetailRow
                      label="Metode Pembayaran"
                      value={
                        <span className="uppercase">
                          {transactionDetail.depositData.bankPayment}
                        </span>
                      }
                    />
                  </div>

                  <div className="my-4 border-t" />

                  <div className="space-y-3">
                    <DetailRow
                      label="Tanggal Penyetujuan"
                      value={transactionDetail.depositData.adminApproved || "-"}
                    />
                    {transactionDetail.depositData.adminNotes && (
                      <Card className="p-3 bg-muted">
                        <p className="text-xs font-semibold mb-1">Catatan Admin:</p>
                        <p className="text-sm">
                          {transactionDetail.depositData.adminNotes}
                        </p>
                      </Card>
                    )}
                    <DetailRow
                      label="Tanggal Pengajuan"
                      value={transactionDetail.depositData.requestDate}
                    />
                  </div>

                  {transactionDetail.depositData.transferReceipt && (
                    <div className="mt-4">
                      <Button asChild variant="outline" className="w-full" size="sm">
                        <a
                          href={`${process.env.NEXT_PUBLIC_BASE_URL}/storage/deposits/${transactionDetail.depositData.transferReceipt}`}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Bukti Transfer
                        </a>
                      </Button>
                    </div>
                  )}

                </Card>
              )}

            {/* Fiat Withdraw Transaction */}
            {transactionFiat &&
              transactionDetail?.withdrawData &&
              (transactionDetail.withdrawData.transactionType === "withdraw" ||
                transactionDetail.withdrawData.transactionType === "Withdraw") && (
                <Card className="p-4">
                  <div className="space-y-3">
                    <DetailRow
                      label="Nomor Transaksi"
                      value={transactionDetail.withdrawData.withdrawId}
                      mono
                    />
                    <DetailRow
                      label="Tipe Transaksi"
                      value={
                        <span className="capitalize">
                          {transactionDetail.withdrawData.transactionType}
                        </span>
                      }
                    />
                    <DetailRow
                      label="Status"
                      value={getStatusBadge(transactionDetail.withdrawData.status)}
                    />
                    <DetailRow
                      label="Ke Rekening"
                      value={
                        <div className="text-right">
                          <p className="uppercase">
                            {transactionDetail.withdrawData.bankCustomer}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            A/N{" "}
                            {transactionDetail.withdrawData.bankCustomerHolderName ||
                              "-"}
                          </p>
                        </div>
                      }
                    />
                    <DetailRow
                      label="Nama Bank"
                      value={
                        <span className="uppercase">
                          {transactionDetail.withdrawData.bankCustomerName}
                        </span>
                      }
                    />
                  </div>

                  <div className="my-4 border-t" />

                  <div className="space-y-3">
                    <DetailRow
                      label="Tanggal Penyetujuan"
                      value={transactionDetail.withdrawData.approvedDate || "-"}
                    />
                    {transactionDetail.withdrawData.adminNotes && (
                      <Card className="p-3 bg-muted">
                        <p className="text-xs font-semibold mb-1">Catatan Admin:</p>
                        <p className="text-sm">
                          {transactionDetail.withdrawData.adminNotes}
                        </p>
                      </Card>
                    )}
                    <DetailRow
                      label="Tanggal Pengajuan"
                      value={transactionDetail.withdrawData.requestDate}
                    />
                  </div>
                </Card>
              )}

            {/* Crypto Wallet Transaction */}
            {transactionWallet && transactionDetail && (
              <Card className="p-4">
                <div className="space-y-3">
                  <DetailRow
                    label="Nomor Transaksi"
                    value={transactionDetail.tradingId || ""}
                    mono
                  />
                  <DetailRow
                    label="Crypto ID"
                    value={transactionDetail.cryptoWalletId || ""}
                    mono
                  />
                  <DetailRow
                    label="Nama Koin"
                    value={
                      <span className="font-semibold">
                        {transactionWallet.cryptocurrencyType.coinName}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Jumlah Koin"
                    value={transactionDetail.coinAmount || ""}
                    mono
                  />
                  <DetailRow
                    label="Jumlah Rupiah"
                    value={`Rp ${Number(
                      transactionWallet.fiatAmountConverted.toFixed(2)
                    ).toLocaleString("id-ID")}`}
                    mono
                  />
                </div>

                <div className="my-4 border-t" />

                <div className="space-y-3">
                  <DetailRow
                    label="Tipe Transaksi"
                    value={<span className="capitalize">{transactionWallet.type}</span>}
                  />
                  <DetailRow
                    label="Alur Transaksi"
                    value={
                      <span className="capitalize">
                        {transactionDetail.walletCashflow || ""}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Tanggal Transaksi"
                    value={transactionDetail.createdDate || ""}
                  />
                </div>
              </Card>
            )}
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Tutup</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTransaction;