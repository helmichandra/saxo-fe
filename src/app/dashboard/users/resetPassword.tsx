import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sessionId } from "@/lib/getSession";
import { logout } from "@/lib/auth";

const ResetPassword = ({
  userId,
  email,
  fullName,
}: {
  userId: number;
  email: string;
  fullName: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const { toast } = useToast();

  const handleResetPassword = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/admin/users/reset-password-manual/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            dev_chronome: "yes",
            authorization: `${sessionId}`,
          },
          body: JSON.stringify({ userId, email }),
        }
      );

      if (response.status === 401) {
        console.warn("Unauthorized. Redirecting...");
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Reset Password Gagal",
          description: data.message,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      setNewPassword(data.data.newPassword);
      setResultModalOpen(true);
      setConfirmationModalOpen(false);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Reset Password Gagal",
        description: String(error),
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={confirmationModalOpen} onOpenChange={setConfirmationModalOpen}>
      <DialogTrigger asChild>
        <span
          onClick={() => setConfirmationModalOpen(true)}
          className="relative hover:bg-gray-100 flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0"
        >
          Reset Password
        </span>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Rubah Password User</DialogTitle>
          <DialogDescription>
            Apa Anda yakin untuk merubah password untuk <strong>{fullName}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setConfirmationModalOpen(false)}>
            Batal
          </Button>
          <Button variant="default" onClick={handleResetPassword} disabled={loading}>
            {loading ? "Loading..." : "Ganti Password"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {resultModalOpen && (
        <Dialog open={resultModalOpen} onOpenChange={setResultModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ganti Password Berhasil</DialogTitle>
              <DialogDescription>
                Berikut merupakan password baru dari user <strong>{fullName || `User ID: ${userId}`}</strong>:
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 w-full">
              <p>{newPassword || ""}</p>
            </div>
            <DialogFooter>
              <Button
                variant="default"
                onClick={() => {
                  setResultModalOpen(false);
                  location.reload();
                }}
              >
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default ResetPassword;
