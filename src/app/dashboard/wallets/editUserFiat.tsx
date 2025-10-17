import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { sessionId } from "@/lib/getSession";
import { FiatsTransaction } from "@/models/Interface";
import { logout } from "@/lib/auth";

const EditUserFiat = ({ wallet }: { wallet: FiatsTransaction }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adjustment, setAdjustment] = useState<number>(0);
  const [remark, setRemark] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/fiat/balance/adjustWalletBalance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            dev_chronome: "yes",
            authorization: `${sessionId}`,
          },
          body: JSON.stringify({
            fiatWalletId: wallet.fiatWalletId,
            fiatNominal: adjustment,
            remark: remark || "-",
          }),
        }
      );

      if (response.status === 401) {
        console.warn("Unauthorized. Logging out...");
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Update Fiat Balance Failed",
          description: data.message || "Failed to adjust the balance.",
          variant: "destructive",
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Update Fiat Balance Success",
        description: "Fiat wallet balance has been updated successfully.",
        duration: 5000,
      });

      setLoading(false);
      setIsDialogOpen(false);
      location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: '' + error || "Something went wrong.",
        variant: "destructive",
        duration: 5000,
      });
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <span className="relative hover:bg-gray-100 flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">
            Edit
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fiat: {wallet.fiatWalletId}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-4">
              <div className="my-2">
                <p className="text-sm font-bold text-red-500">Catatan:</p>
                <ul className="text-sm list-disc ps-5 text-gray-500">
                  <li>
                    Untuk mengurangi saldo, gunakan nilai negatif (contoh: <strong>-1000</strong>).
                  </li>
                  <li>
                    Untuk meningkatkan saldo, masukkan nilai positif (contoh: <strong>1000</strong>).
                  </li>
                </ul>
              </div>
              <Label>Jumlah Fiat</Label>
              <Input
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(Number(e.target.value))}
                placeholder="Enter adjustment amount"
                required
              />
              <small>Jumlah Fiat Sekarang: {wallet.balance.toLocaleString()}</small>
            </div>
            <div className="form-group mb-4">
              <Label>Catatan Admin</Label>
              <Input
                type="text"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Enter admin notes"
                required
              />
              <small>Bila dikosongkan, isi dengan (-).</small>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Loading..." : "Update Fiat Balance"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditUserFiat;
