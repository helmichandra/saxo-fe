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
import { User } from "@/models/Interface";

const ViewUser = (user: User) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <span className="relative hover:bg-gray-100 flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">
            Lihat
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border py-3 px-5">
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">User Number:</span>
              <p className="uppercase">{user.userNumber}</p>
            </div>
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">Full Name:</span>
              <p className="capitalize">{user.fullName}</p>
            </div>
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">Email:</span>
              <p className="">{user.email}</p>
            </div>
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">Nomor Handphone:</span>
              <p className="capitalize">{user.phoneNumber}</p>
            </div>
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">Status:</span>
              <p
                className={`border rounded-full px-3 py-1 flex justify-center font-bold ${
                  user.isActive
                    ? "text-green-500 border-green-500"
                    : "text-red-500 border-red-500"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">Kredit Skor:</span>
              <p>                
                {user.creditScore}
              </p>
            </div>
            <div className="border border-gray my-3"></div>
            {user.adminNotes != "" && user.adminNotes != null && (
              <div className="flex flex-col bg-gray-100 rounded-lg justify-between gap-1 py-3 px-3">
              <span className="font-bold">Catatan Admin:</span>
              <p className="">{user.adminNotes}</p>
            </div>
            )}
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">Tanggal Pendaftaran:</span>
              <p className="capitalize">
                {new Date(user.createdDate).toLocaleString("en-US", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </p>
            </div>
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">Tanggal Perubahan:</span>
              <p className="capitalize">
                {new Date(user.modifiedDate).toLocaleString("en-US", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </p>
            </div>
          </div>
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

export default ViewUser;
