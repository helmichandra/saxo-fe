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
import { useToast } from "@/hooks/use-toast";
import { sessionId } from "@/lib/getSession";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logout } from "@/lib/auth";

const AddCommision = ({ userId, fullName }: { userId: number, fullName: string }) => {
  const [coinAmount, setCoinAmount] = useState(0);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {

    if (!coinAmount || coinAmount <= 0) {
        toast({
        title: "Gagal Menambahkan Komisi",
        description: "Tidak boleh kosong atau 0",
        variant: "destructive",
        });
        return;
    }

    try {
      setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trade/commision-commit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            dev_chronome: "yes",
            authorization: `${sessionId}`
          },
          body: JSON.stringify({ userId, coinAmount }),
        });

      if (response.status === 401) {
        console.warn("Unauthorized. Redirecting...");
        logout();
        return;
      }
    
        const data = await response.json();
        if (response.ok) {
          toast({
            title: "Success",
            description: "Commission added successfully!"
          });
        } else {
          toast({
            title: "Error",
            description: data.message,
            variant: "destructive"
          });
        }
        setLoading(false);
        setIsDialogOpen(false);
        location.reload();
    }catch(error){
        toast({
            title: "Error",
            description: "Something went wrong " + error,
            variant: "destructive"
        });
        setLoading(false);
    }

  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <span className="relative hover:bg-gray-100 flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">
            Tambah Komisi
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambahkan Komisi (USDt) untuk <span className="capitalize">{fullName}</span></DialogTitle>
          </DialogHeader>
          <Label required>Jumlah Komisi (dalam USDt)</Label>
          <Input 
            type="number"
            required
            value={coinAmount || ""}
            onChange={(e) => setCoinAmount(Number(e.target.value))}
            className="flex-grow"
            placeholder="Masukkan jumlah koin USDt, misal 1, 0,2, 0,5"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSubmit} variant="default" disabled={loading}>
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
                  "Tambah Komisi"
                )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddCommision;

