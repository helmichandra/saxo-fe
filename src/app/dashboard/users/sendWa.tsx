import React, { SyntheticEvent, useState } from "react";

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
import { Member } from "@/models/Interface";
import { useToast } from "@/hooks/use-toast";
import { getCookie, logout } from "@/lib/auth";

const SendWa = (member: Member) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const sessionId = getCookie("sessionId");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/admin/users/send-wa-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            dev_chronome: "yes",
            authorization: `${sessionId}`,
          },
          body: JSON.stringify({
            phoneNumber: member.phoneNoReg,
          }),
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
          title: "Konfirmasi Member Gagal",
          description: data.message,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      toast({
        title: "Konfirmasi Member Berhasil",
        description: data.message,
        duration: 5000,
      });

      location.reload();

      setLoading(false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Konfirmasi Member Gagal",
        description: "" + error,
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <span className="relative hover:bg-gray-100 flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">
            Berikan Kode
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Member</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="py-4">
              Konfirmasi user baru ke{" "}
              <span className="text-red-500 font-bold">
                {member.phoneNoReg}
              </span>{" "}
              untuk menjadi member?
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit" variant="default" disabled={loading}>
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
                  "Berikan Kode"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SendWa;
