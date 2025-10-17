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
import { useToast } from "@/hooks/use-toast";
import { sessionId } from "@/lib/getSession";
import { logout } from "@/lib/auth";

type DeleteBankProps = {
  mode: "user";
  bank: {
    userBankAccountId: string;
    bankName: string;
  };
};

const DeleteBank: React.FC<DeleteBankProps> = ({ mode, bank }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const apiEndpointUser = `${process.env.NEXT_PUBLIC_API_URL}/fiat/deleteUserBank`;

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiEndpointUser, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          dev_chronome: "yes",
          authorization: `${sessionId}`,
        },
        body: JSON.stringify({
          userBankAccountId: bank.userBankAccountId,
        }),
      });

      if (response.status === 401) {
        console.warn("Unauthorized. Redirecting...");
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Gagal Menghapus Bank",
          description: data.message,
          variant: "destructive",
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Bank Berhasil Dihapus",
        description: `Bank "${bank.bankName}" berhasil dihapus.`,
        duration: 5000,
      });

      location.reload();
    } catch (error) {
      console.error("Error deleting bank:", error);
      toast({
        title: "Gagal Menghapus Bank",
        description: `${error}`,
        variant: "destructive",
        duration: 5000,
      });
      setLoading(false);
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <span className="text-red-500 relative hover:bg-gray-100 flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">
            Hapus
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Hapus {mode === "user" ? "Bank Pengguna" : "Bank Perusahaan"}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Anda akan menghapus bank: <br />
            <strong>{bank.bankName}</strong>. Lanjutkan?
          </DialogDescription>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
            </DialogClose>
            <Button onClick={handleDelete} variant="destructive" disabled={loading}>
                {loading ? (
                  <>
                    <span>Loading </span>
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="inline w-4 h-4 mr-3 text-white animate-spin"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      >
                      <path
                        d="M100 50.5A50 50 0 1 1 50 0v10a40 40 0 1 0 40 40h10z"
                        fill="currentColor"
                        />
                    </svg>
                  </>
                ) : (
                  "Hapus Bank"
                )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeleteBank;
