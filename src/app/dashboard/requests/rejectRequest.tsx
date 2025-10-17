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
import { Input } from "@/components/ui/input";
import { FiatsTransaction } from "@/models/Interface";
import { useToast } from "@/hooks/use-toast";
import { getCookie, logout } from "@/lib/auth";

type RejectRequestProps = {
  request: FiatsTransaction;
};

const RejectRequest: React.FC<RejectRequestProps> = ({ request }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [adminNotes, setAdminNotes] = useState<string>("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    const sessionId = getCookie("sessionId");
    const endpoint =
      request.transactionType === "Deposit"
        ? `${process.env.NEXT_PUBLIC_API_URL}/fiat/request/deposit/reject`
        : `${process.env.NEXT_PUBLIC_API_URL}/fiat/request/withdraw/reject`;

    try {
      setLoading(true);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          dev_chronome: "yes",
          authorization: `${sessionId}`,
        },
        body: JSON.stringify({
          [request.transactionType === "Deposit" ? "depositId" : "withdrawId"]:
            request.transactionId,
          adminNotes:adminNotes,
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
          title: "Rejection Failed",
          description: data.message,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      toast({
        title: "Rejection Successful",
        description: `Request ${request.transactionId} rejected successfully.`,
        duration: 5000,
      });
      
      setLoading(false);
      location.reload();
    } catch (error) {
      console.error(error);
      toast({
        title: "Rejection Failed",
        description: `${error}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsDialogOpen(false);
    }
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <span className="relative text-red-500 hover:bg-gray-100 flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">
            Reject
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Please provide a reason for rejecting the transaction{" "}
            <strong>{request.transactionId}</strong>.
          </DialogDescription>
          <Input
            type="text"
            placeholder="Reason for rejection"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            required
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleReject} variant="destructive" disabled={loading}>
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
                  "Reject"
                )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RejectRequest;
