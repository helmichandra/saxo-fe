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
import { FiatsTransaction } from "@/models/Interface";
import { useToast } from "@/hooks/use-toast";
import { getCookie, logout } from "@/lib/auth";

type ApproveRequestProps = {
  request: FiatsTransaction;
};

const ApproveRequest: React.FC<ApproveRequestProps> = ({ request }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    const sessionId = getCookie("sessionId");
    const endpoint =
      request.transactionType === "Deposit"
        ? `${process.env.NEXT_PUBLIC_API_URL}/fiat/request/deposit/approve`
        : `${process.env.NEXT_PUBLIC_API_URL}/fiat/request/withdraw/approve`;

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
          title: "Approval Failed",
          description: data.message,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      toast({
        title: "Approval Successful",
        description: `Request ${request.transactionId} approved successfully.`,
        duration: 5000,
      });
      setLoading(false);
      location.reload();
    } catch (error) {
      console.error(error);
      toast({
        title: "Approval Failed",
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
          <span className="relative text-green-500 hover:bg-gray-100 flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">
            Approve
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to approve the transaction{" "}
            <strong>{request.transactionId}</strong>?
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleApprove} variant="default" disabled={loading}>
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
                  "Approve"
                )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApproveRequest;
